# ghost-proxy
A rest API proxy for the Ghost blogging platform.

![](assets/ghost-proxy.png)

## Features
* Works with any Ghost Installation
* Blacklist Endpoints
* CORS Rules

## Installation
```
git clone https://github.com/jamrizzi/ghost-proxy.git
cd ghost-proxy
npm install
```

## Usage
1. Configure ghost-proxy under the options object in the app.js file.

    ```js
    var options = {
        ghost: process.env.GPROXY_GHOST || 'myghost.com', // location of your ghost installation
        blog: process.env.GPROXY_BLOG || 'myblog.com', // location of the blog using the ghost proxy
        username: process.env.GPROXY_USERNAME || 'username', // ghost login username
        password: process.env.GPROXY_PASSWORD || 'password', // ghost login password
				clientSecret: process.env.GPROXY_CLIENT_SECRET || 'c38dcd39fb6f', // ghost login client_secret
        blacklist: process.env.GPROXY_BLACKLIST ? process.env.GPROXY_BLACKLIST.replace(' ', '').split(',') : [ // array of blacklisted endpoints
            '/users'
        ],
        port: process.env.GPROXY_PORT || 3008 // port for the ghost proxy server
    };
    ```

2. Run the following command.

    ```
    node app.js
    ```

## Docker
View on [Docker](https://hub.docker.com/r/jamrizzi/ghost-proxy).
### Usage

```
sudo docker run --name ghost-proxy -d -p 3008:3008 -e GPROXY_GHOST=myghost.com -e GPROXY_USERNAME=username -e GPROXY_PASSWORD=password jamrizzi/ghost-proxy:latest
```

### Environment Variables
* GPROXY_GHOST - location of your ghost installation
* GPROXY_BLOG - location of the blog using the ghost proxy
* GPROXY_USERNAME - ghost login username
* GPROXY_PASSWORD - ghost login password
* GPROXY_BLACKLIST - comma separated list of blacklisted endpoints
* GPROXY_PORT - port of the ghost proxy server
* GPROXY_CLIENT_SECRET - ghost login client_secret (set to 'c38dcd39fb6f' by default)

## Planned Features
* Advanced Blacklist Rules

## Contributing
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Credits
* [Jam Risser](http://jam.jamrizzi.com)

## License
This project is licensed under the [GNU Public License version 3.0](https://www.gnu.org/licenses/gpl-3.0.en.html)
