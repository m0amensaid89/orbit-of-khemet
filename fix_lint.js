const fs = require('fs');

let code = fs.readFileSync('src/app/chat/[hero]/chat-client.tsx', 'utf8');

// fix any
code = code.replace(/let renderedOutput: any = null;/, 'let renderedOutput: RenderedOutput | null = null;');

// fix useCallback for handleInputChange
code = code.replace(/const handleInputChange = \(e: React.ChangeEvent<HTMLInputElement>\) => {/, 'const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {');
code = code.replace(/setInput\(e.target.value\);\n  };/, 'setInput(e.target.value);\n  }, []);');

fs.writeFileSync('src/app/chat/[hero]/chat-client.tsx', code);
