import * as fs from 'fs-extra'
import {load} from 'js-yaml'
import {cliArgs} from 'Builder/utils'
import {setConfig} from 'Builder/taskList'

export default {
  beforeAll: [
      async () => {
        const ls = await fs.readdir(`${process.cwd()}/npm`);
        for (const path of ls) {
            // filter repo elements
            const ls = (await fs.readdir(`${process.cwd()}/npm/${path}`)).filter(el => ![".git", ".gitignore", ".npmrc"].includes(el));

            for (const element of ls) {
                await fs.rm(`${process.cwd()}/npm/${path}/${element}`, {recursive: true});
            }
        }

      },
    // () => fs.emptyDir(`${process.cwd()}/npm`),
    async () => {
      process.env.IS_BUILD = 'true'
    },
    async () => {
      if (cliArgs.current.length < 1) return
      const argRaw = cliArgs.current[0]
      let body
      try {
        body = load(argRaw)
      } catch {
        return
      }
      if (typeof body !== 'object' || body === null) return
      cliArgs.current.splice(0, 1)
      for (const field in body) {
        //$todo
        setConfig(field, body[field])
      }
    },
  ],
}
