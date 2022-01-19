"use strict";

let join_query_id = Object.fromEntries(new URLSearchParams(window.location.search).entries()).room;

// Router.

class Router {
    constructor(path) {
        this.current_path = path || "index";
        this.cached = {};

        this.paths = {
            loading: {
                path: "loading",
                title: "Loading..."
            },
            disconnected: {
                path: "disconnected",
                title: "Disconnected"
            },

            index: {
                path: "index",
                title: "Home"
            },

            play: {
                path: "play",
                title: "Play"
            },

            licenses: {
                path: "licenses",
                title: "Licenses"
            },

            terms: {
                path: "terms",
                title: "Terms of Services"
            },
            privacy: {
                path: "privacy",
                title: "Privacy Policy"
            }
        }

        this.main = document.querySelector("main");

        // Load page.

        this.load("loading", true);

        (async () => {
            for (const [ _, { path } ] of Object.entries(this.paths)) {
                await this.get(path);
            }
        })();
    }

    async load(new_path, first_time, back) {
        if (new_path == this.current_path && !first_time) return;
        if (!this.paths[new_path]) return this.load("index");

        if (!["loading", "play"].includes(new_path)) join_query_id = undefined;

        let { unload } = this.paths[this.current_path];
        if (unload) unload(new_path);

        this.current_path = new_path;

        let { path, title, load } = this.paths[new_path];
        const html = await this.get(path);

        this.main.innerHTML = html;
        
        document.title = `Hidodie - ${title}`;

        if (path == "index") path = "";

        if (path !== "loading" && path !== "disconnected" && !back) 
            window.history.pushState({ path }, "", `/${new_path == "index" ? "" : new_path}`);

        if (load) load();
    }

    async get(html_file) {
        if (!this.cached[html_file]) {
            try {
                const page = await fetch(`/assets/html/${html_file}.html`);
                if (!this.cached[html_file]) // Just in case this is ran twice (or more) before it loads.
                    this.cached[html_file] = await page.text();   
            } catch(err) {
                console.log(`[ROUTER] Could not fetch /assets/html/${html_file}.html.`);
                console.log(err);

                return "An unexpected error has occured.";
            }         
        }
    
        return this.cached[html_file];
    }
}

// Load styles.

document.querySelector("head").insertAdjacentHTML("beforeend", `<link rel="stylesheet" href="/assets/css/style.css">`);

// Load router.

let router = new Router();

window.onpopstate = function(e) {
    if (e.state) {
        if (e.state.path !== "play") wsSend({ a: "leave_room" });
        router.load(e.state.path || "index", false, true);
    }
};

document.body.onclick = evt => {
    if (evt.target.tagName.toLowerCase() == "a") {
        let without_http = evt.target.href
            .replace(/(^\w+:|^)\/\//, ""); // https://newbedev.com/javascript-remove-http-and-https-from-url-javascript-code-example
        let domain = location.host + (location.port == 80 || location.port == "" ? "" : `:${location.port}`) + "/";

        if (without_http.startsWith(domain)) {
            let path = without_http.slice(domain.length).split("#")[0]
            if (path.startsWith("admin")) return true;

            router.load(path || "index");
            return false;
        }
        
        window.open(evt.target.href, '_blank');
    }

    if (evt.target.tagName.toLowerCase() == "input") return true;

    return false;
};

// Load scripts.

const scripts = [
    "cookies",

    "right_click",

    "scripts/index",
    "scripts/licenses",

    "game/setup",
    "game/usernames",
    "game/status",
    "game/settings",
    "game/movement",
    "game/particle_caught",
    "game/particle_teleported",
    "game/sketch",
    "game/chat",
    "scripts/play",
    
    "websocket" // MAKE "websocket" LOAD AFTER ALL THE PAGE SCRIPTS!!!
];

const version = "1642554054665"; /* Change this in index.html. Also, change the folder name. */

// https://usefulangle.com/post/343/javascript-load-multiple-script-by-order

(async () => {
    for (const name of scripts) await loadScript(`/assets/js/${version}/${name}.js`);
})();

function loadScript(url) {
	return new Promise(function(resolve, reject) {
		let script = document.createElement('script');
		script.src = url;
		script.async = false;
		script.onload = () => {
			resolve(url);
		};
		script.onerror = () => {
			reject(url);
		};
		document.body.appendChild(script);
	});
}