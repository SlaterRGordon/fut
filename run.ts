import * as readline from 'readline';
import { authenticate, twoFactor } from './authenticate';
import { keys } from './keys';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

rl.question('Press any key to start: ', async (answer) => {
    var resp = await authenticate("slats2626@outlook.com", "$Logan1992")

    var code = ""
    rl.question('Enter the SMS Code: ', async (answer) => {
        code = answer
        resp = await twoFactor(code, "https://signin.ea.com" + resp.headers.location)
        console.log(keys)
    })
})



