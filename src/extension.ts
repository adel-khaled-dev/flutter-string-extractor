import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const DICTIONARY: Record<string, { en: string, key: string }> = {
  'متاح': { en: 'Available', key: 'available' },
  'غير متاح': { en: 'Not Available', key: 'notAvailable' },
  'بحث': { en: 'Search', key: 'search' },
  'حفظ': { en: 'Save', key: 'save' },
  'حذف': { en: 'Delete', key: 'delete' },
  'تعديل': { en: 'Edit', key: 'edit' },
  'اضافة': { en: 'Add', key: 'add' },
  'الرئيسيه': { en: 'Home', key: 'home' },
  'المخزون': { en: 'Inventory', key: 'inventory' },
  'الاعدادات': { en: 'Settings', key: 'settings' },
  'الكاشير': { en: 'Cashier', key: 'cashier' },
  'بيع جديد': { en: 'New Sale', key: 'newSale' },
  'منتج جديد': { en: 'New Product', key: 'newProduct' },
  'فاتوره جديدة': { en: 'New Invoice', key: 'newInvoice' },
  'الاجمالي': { en: 'Total', key: 'total' },
  'كاش': { en: 'Cash', key: 'cash' },
  'السله': { en: 'Basket', key: 'basket' },
  'جنيه': { en: 'EGP', key: 'pound' },
};

function suggestKey(text: string): string {
  const clean = text.replace(/\$[a-zA-Z_]+/g, '').replace(/\$\{[^}]+\}/g,'').trim();
  if (DICTIONARY[clean]) return DICTIONARY[clean].key;
  if (/^[a-zA-Z ]+$/.test(text)) {
    const parts = text.trim().split(/\s+/);
    return parts[0].toLowerCase() + parts.slice(1).map(p => p[0].toUpperCase() + p.slice(1).toLowerCase()).join('');
  }
  return '';
}
function extractVariables(text: string) {
  const vars: string[] = [];
  const template = text.replace(/\$(\w+)|\$\{(\w+)\}/g, (_, v1, v2) => { const v = v1 || v2; if(!vars.includes(v)) vars.push(v); return `{${v}}`; });
  return { template, vars };
}
function getLangFiles() {
  const ws = vscode.workspace.workspaceFolders?.[0];
  if (!ws) throw new Error('No workspace');
  const base = ws.uri.fsPath;
  return {
    arPath: path.join(base, 'lib', 'l10n', 'ar.json'),
    enPath: path.join(base, 'lib', 'l10n', 'en.json'),
    stringsPath: path.join(base, 'lib', 'core', 'constants', 'app_strings.dart'),
  };
}
function readJson(file: string): Record<string,string> {
  if (!fs.existsSync(file)) return {};
  try { return JSON.parse(fs.readFileSync(file,'utf8')); } catch { return {}; }
}
function writeJson(file: string, data: Record<string,string>) {
  fs.mkdirSync(path.dirname(file), {recursive:true});
  fs.writeFileSync(file, JSON.stringify(data,null,2)+'\n');
}
function getPackageName(): string {
  try {
    const ws = vscode.workspace.workspaceFolders?.[0];
    const pubspec = fs.readFileSync(path.join(ws!.uri.fsPath,'pubspec.yaml'),'utf8');
    return pubspec.match(/^name:\s*(.+)$/m)?.[1].trim() || 'app';
  } catch { return 'app'; }
}
async function extractOne() {
  const editor = vscode.window.activeTextEditor; if(!editor) return;
  const doc = editor.document;
  let selected = doc.getText(editor.selection).trim();
  if(!selected){
    const range = doc.getWordRangeAtPosition(editor.selection.active, /["'][^"']*["']/);
    if(range) selected = doc.getText(range);
  }
  const rawValue = selected.replace(/^["']|["']$/g,'').trim();
  if(!rawValue) return;
  const { template, vars } = extractVariables(rawValue);
  const suggested = suggestKey(rawValue);
  const { arPath, enPath, stringsPath } = getLangFiles();
  const arData = readJson(arPath);
  let finalKey = Object.keys(arData).find(k => arData[k] === template);
  if(!finalKey){
    const key = await vscode.window.showInputBox({ prompt: `اسم المتغير لـ "${rawValue}"`, value: suggested, validateInput: v => /^[a-z][a-zA-Z0-9_]*$/.test(v) ? null : 'لازم يبدأ بحرف صغير' });
    if(!key) return;
    const defaultEn = DICTIONARY[rawValue]?.en || '';
    const en = await vscode.window.showInputBox({ prompt: `الترجمة الانجليزية لـ "${rawValue}"`, value: defaultEn, placeHolder: 'Available' });
    if(en===undefined) return;
    finalKey = key;
    arData[finalKey] = template; writeJson(arPath, arData);
    if(en.trim()){
      const enData = readJson(enPath);
      enData[finalKey] = extractVariables(en.trim()).template;
      writeJson(enPath, enData);
    }
    let stringsContent = fs.existsSync(stringsPath) ? fs.readFileSync(stringsPath,'utf8') : `abstract class AppStrings {\n}\n`;
    if(!stringsContent.includes(` ${finalKey} =`) && !stringsContent.includes(` ${finalKey}(`)){
      let newLine = '';
      if(vars.length>0){
        newLine = `  static String ${finalKey}({${vars.map(v=>`required String ${v}`).join(', ')}}) => '${rawValue.replace(/'/g,"\\'")}';\n`;
      } else {
        newLine = `  static const String ${finalKey} = '${rawValue.replace(/'/g,"\\'")}';\n`;
      }
      const lastBrace = stringsContent.lastIndexOf('}');
      stringsContent = stringsContent.slice(0,lastBrace)+newLine+stringsContent.slice(lastBrace);
      fs.mkdirSync(path.dirname(stringsPath),{recursive:true});
      fs.writeFileSync(stringsPath, stringsContent);
    }
  }
  let replacement = `AppStrings.${finalKey}`;
  if(vars.length>0) replacement = `AppStrings.${finalKey}(${vars.map(v=>`${v}: ${v}`).join(', ')})`;
  await editor.edit(eb=>eb.replace(editor.selection, replacement));
  if(!doc.getText().includes('app_strings')){
    const importLine = `import 'package:${getPackageName()}/core/constants/app_strings.dart';\n`;
    await editor.edit(eb=>eb.insert(new vscode.Position(0,0), importLine));
  }
  vscode.window.showInformationMessage(`تم ✅ AppStrings.${finalKey} + ترجمة`);
}
async function extractAllInFile() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  const doc = editor.document;
  const text = doc.getText();
  const regex = /"([^"\n]+)"|'([^'\n]+)'/g;
  const matches = [...text.matchAll(regex)].filter(m => {
    const val = (m[1] ?? m[2]).trim();
    if (val.includes('package:') || val.includes('dart:')) return false;
    if (val.includes('/')) return false;
    if (val.startsWith('http')) return false;
    if (val.length < 2) return false;
    return true;
  });
  if (matches.length === 0) {
    vscode.window.showInformationMessage('مفيش نصوص في الملف ده');
    return;
  }
  const ok = await vscode.window.showWarningMessage(
    `لقيت ${matches.length} نص، أحولهم كلهم لـ AppStrings؟`,
    'أيوه حوّلهم', 'لا'
  );
  if (ok !== 'أيوه حوّلهم') return;
  const { arPath, enPath, stringsPath } = getLangFiles();
  let arData = readJson(arPath);
  let enData = readJson(enPath);
  let stringsContent = fs.existsSync(stringsPath)
    ? fs.readFileSync(stringsPath, 'utf8')
    : `abstract class AppStrings {\n}\n`;
  for (let i = matches.length - 1; i >= 0; i--) {
    const m = matches[i];
    const rawValue = (m[1] ?? m[2]).trim();
    const { template, vars } = extractVariables(rawValue);
    let key = Object.keys(arData).find(k => arData[k] === template);
    if (!key) {
      key = suggestKey(rawValue) || `text${i}`;
      let base = key; let c = 1;
      while (arData[key] && arData[key] !== template) key = `${base}${c++}`;
      arData[key] = template;
      const autoEn = DICTIONARY[rawValue]?.en;
      if (autoEn && !enData[key]) {
        enData[key] = extractVariables(autoEn).template;
      }
      if (!stringsContent.includes(` ${key} =`) && !stringsContent.includes(` ${key}(`)) {
        let newLine = '';
        if (vars.length > 0) {
          newLine = `  static String ${key}({${vars.map(v => `required String ${v}`).join(', ')}}) => '${rawValue.replace(/'/g, "\\'")}';\n`;
        } else {
          newLine = `  static const String ${key} = '${rawValue.replace(/'/g, "\\'")}';\n`;
        }
        const lastBrace = stringsContent.lastIndexOf('}');
        stringsContent = stringsContent.slice(0, lastBrace) + newLine + stringsContent.slice(lastBrace);
      }
    }
    const range = new vscode.Range(
      doc.positionAt(m.index!),
      doc.positionAt(m.index! + m[0].length)
    );
    let replacement = `AppStrings.${key}`;
    if (vars.length > 0) replacement = `AppStrings.${key}(${vars.map(v => `${v}: ${v}`).join(', ')})`;
    await editor.edit(eb => eb.replace(range, replacement));
  }
  writeJson(arPath, arData);
  writeJson(enPath, enData);
  fs.mkdirSync(path.dirname(stringsPath), { recursive: true });
  fs.writeFileSync(stringsPath, stringsContent);
  if (!doc.getText().includes('app_strings')) {
    const importLine = `import 'package:${getPackageName()}/core/constants/app_strings.dart';\n`;
    await editor.edit(eb => eb.insert(new vscode.Position(0, 0), importLine));
  }
  vscode.window.showInformationMessage(`تم ✅ حولت ${matches.length} نص لـ AppStrings`);
}
export function activate(context: vscode.ExtensionContext){
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.extractOne', extractOne),
    vscode.commands.registerCommand('extension.extractAllInFile', extractAllInFile)
  );
}
export function deactivate(){}
