import bcrypt from "bcryptjs";
import { stdin, stdout } from "node:process";

function readHiddenPassword(): Promise<string> {
  if (!stdin.isTTY || !stdin.setRawMode) {
    throw new Error("Execute este comando em um terminal interativo.");
  }

  return new Promise((resolve, reject) => {
    let password = "";
    stdout.write("Nova senha administrativa (mínimo 12 caracteres): ");
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    const cleanup = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
      stdout.write("\n");
    };
    const onData = (key: string) => {
      if (key === "\u0003") {
        cleanup();
        reject(new Error("Operação cancelada."));
      } else if (key === "\r" || key === "\n") {
        cleanup();
        resolve(password);
      } else if (key === "\u007f" || key === "\b") {
        password = password.slice(0, -1);
      } else {
        password += key;
      }
    };

    stdin.on("data", onData);
  });
}

const password = await readHiddenPassword();

if (password.length < 12) {
  throw new Error("Use uma senha com pelo menos 12 caracteres.");
}

console.log(await bcrypt.hash(password, 12));
