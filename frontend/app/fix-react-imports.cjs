const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// 非同期関数として実行
async function fixReactImports() {
  try {
    // src ディレクトリ内のすべての .tsx ファイルを検索
    const files = await glob('src/**/*.tsx', { cwd: __dirname });
    
    console.log(`Found ${files.length} files to process`);

    files.forEach(file => {
      const filePath = path.join(__dirname, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // パターンを検索して置換
      let modified = false;
      
      // 1. import React, { ... } パターンの処理
      const reactPattern1 = /import React,\s*{/g;
      if (reactPattern1.test(content)) {
        content = content.replace(reactPattern1, 'import {');
        modified = true;
      }
      
      // 2. import React from 'react' パターンの処理
      const reactPattern2 = /import React from ['"]react['"];?/g;
      if (reactPattern2.test(content)) {
        content = content.replace(reactPattern2, '');
        modified = true;
      }
      
      // 3. ReactのHTML属性に関するアクセスの修正
      const htmlPattern = /React\.HTMLAttributes/g;
      if (htmlPattern.test(content)) {
        content = content.replace(htmlPattern, 'HTMLAttributes');
        modified = true;
      }
      
      // 4. React.の接頭辞が不要な他のパターンの修正
      const reactDotPattern = /React\.([A-Z][a-zA-Z]+)/g;
      if (reactDotPattern.test(content)) {
        content = content.replace(reactDotPattern, (match, p1) => {
          const reactHooks = ['useState', 'useEffect', 'useContext', 'useReducer', 'useCallback', 'useMemo', 'useRef', 'useImperativeHandle', 'useLayoutEffect', 'useDebugValue'];
          const reactComponents = ['Fragment', 'Component', 'PureComponent', 'memo', 'forwardRef', 'lazy', 'Suspense'];
          const reactUtilities = ['createElement', 'cloneElement', 'createContext', 'Children'];
          
          if (reactHooks.includes(p1) || reactComponents.includes(p1) || reactUtilities.includes(p1)) {
            return p1;
          }
          return match;
        });
        modified = true;
      }
      
      if (modified) {
        // 重複した空行を削除
        content = content.replace(/\n\n+/g, '\n\n');
        
        // 最初に空行がある場合は削除
        content = content.replace(/^\n+/, '');
        
        // 必要なimportを追加
        const needsReactHooks = /use(State|Effect|Context|Reducer|Callback|Memo|Ref|ImperativeHandle|LayoutEffect|DebugValue)/.test(content);
        const needsReactComponents = /(Fragment|Component|PureComponent|memo|forwardRef|lazy|Suspense)/.test(content);
        const needsReactUtilities = /(createElement|cloneElement|createContext|Children)/.test(content);
        
        if (needsReactHooks || needsReactComponents || needsReactUtilities) {
          const imports = [];
          
          if (needsReactHooks) {
            ['useState', 'useEffect', 'useContext', 'useReducer', 'useCallback', 'useMemo', 'useRef', 'useImperativeHandle', 'useLayoutEffect', 'useDebugValue'].forEach(hook => {
              if (new RegExp(hook).test(content) && !imports.includes(hook)) {
                imports.push(hook);
              }
            });
          }
          
          if (needsReactComponents) {
            ['Fragment', 'Component', 'PureComponent', 'memo', 'forwardRef', 'lazy', 'Suspense'].forEach(comp => {
              if (new RegExp(comp).test(content) && !imports.includes(comp)) {
                imports.push(comp);
              }
            });
          }
          
          if (needsReactUtilities) {
            ['createElement', 'cloneElement', 'createContext', 'Children'].forEach(util => {
              if (new RegExp(util).test(content) && !imports.includes(util)) {
                imports.push(util);
              }
            });
          }
          
          if (imports.length > 0) {
            const importStatement = `import { ${imports.join(', ')} } from 'react';`;
            
            // 既存のimportの後に追加
            const importRegex = /^(import\s+.*\s+from\s+['"'][^'"]+['"];?)/gm;
            let lastImportIndex = -1;
            let match;
            
            while ((match = importRegex.exec(content)) !== null) {
              lastImportIndex = match.index + match[0].length;
            }
            
            if (lastImportIndex !== -1) {
              content = content.slice(0, lastImportIndex) + '\n' + importStatement + content.slice(lastImportIndex);
            } else {
              content = importStatement + '\n\n' + content;
            }
          }
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed: ${file}`);
      }
    });
    
    console.log('Finished processing files');
  } catch (err) {
    console.error('Error:', err);
  }
}

// 実行
fixReactImports();
