import { login } from './authenticate';
import { initConfig } from './core/config';
import { keys } from './data/keys';

async function testing() {
    login();
    console.log("Logged In: ", keys)

    initConfig();
    console.log("Got config: ", keys)
}