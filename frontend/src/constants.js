export const LANGUAGE_VERSIONS = {
    python: "3.10.0",
    javascript: "18.15.0",
    java: "15.0.2",
    php: "8.2.3",
    cpp: "10.2.0",
    c: "10.2.0",
  };

  export const CODE_SNIPPETS = {
    javascript: `\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`,
    python: `\ndef greet(name):\n\tprint("Hello, " + name + "!")\n\ngreet("Alex")\n`,
    java: `\npublic class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}\n`,
    php: "<?php\n\n$name = 'Alex';\necho $name;\n",
    cpp: `\n#include <iostream>\nusing namespace std;\n\nint main() {\n\tstring name = "Alex";\n\tcout << "Hello, " << name << "!" << endl;\n\treturn 0;\n}\n`,
    c: `\n#include <stdio.h>\n\nint main() {\n\tchar name[] = "Alex";\n\tprintf("Hello, %s!\\n", name);\n\treturn 0;\n}\n`
};
