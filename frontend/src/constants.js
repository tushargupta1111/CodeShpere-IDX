export const LANG_VERSIONS = {
  python:     '3.10 (Pyodide)',
  javascript: 'ES2023 (Sandbox)',
  java:       '15.0.2 (Judge0)',
  cpp:        'GCC 10.2 (Judge0)',
  c:          'GCC 10.2 (Judge0)',
  php:        '8.2.3 (Judge0)',
};

export const LANG_VERSION_SHORT = {
  python:     '3.10',
  javascript: 'ES2023',
  java:       '15.0.2',
  cpp:        'GCC 10.2',
  c:          'GCC 10.2',
  php:        '8.2.3',
};

export const LANGUAGES = Object.keys(LANG_VERSIONS);

export const CODE_SNIPPETS = {
  javascript: `function greet(name) {
  console.log("Hello, " + name + "!");
}

greet("Alex");
`,
  python: `def greet(name):
    print("Hello, " + name + "!")

greet("Alex")
`,
  java: `public class HelloWorld {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
  }
}
`,
  cpp: `#include <iostream>
using namespace std;

int main() {
  string name = "Alex";
  cout << "Hello, " << name << "!" << endl;
  return 0;
}
`,
  c: `#include <stdio.h>

int main() {
  char name[] = "Alex";
  printf("Hello, %s!\\n", name);
  return 0;
}
`,
  php: `<?php

$name = "Alex";
echo "Hello, " . $name . "!\\n";
`,
};

export const LANG_ICONS = { 
  python:"🐍", 
  javascript:"⚡", 
  java:"☕", 
  php:"🐘", 
  cpp:"⚙️", 
  c:"🔧" 
};
