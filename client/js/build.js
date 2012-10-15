({
    appDir: "../",
    baseUrl: "js/",
    dir: "../../clientbuild",
    
    paths: {
        "jquery": "lib/require-jquery"
    },

    modules: [
        {
            name: "main",
            exclude: ["jquery"]
        }
    ]
})

