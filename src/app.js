
import React, { Component } from 'react';
import { render } from 'react-dom';
import { Provider } from 'mobx-react';
import { Router, hashHistory } from 'react-router';
import ElectronCookies from '@exponent/electron-cookies';
import { ipcRenderer } from 'electron';

import './global.css';
import './assets/fonts/icomoon/style.css';
import 'utils/albumcolors';
import getRoutes from './js/routes';
import stores from './js/stores';

ElectronCookies.enable({
    origin: 'https://wx.qq.com',
});

class App extends Component {
    async componentWillMount() {
        await stores.session.hasLogin();
        await stores.settings.init();
        await stores.search.getHistory();
    }

    componentDidMount() {
        ipcRenderer.on('hide-tray', () => {
            stores.settings.setShowOnTray(false);
        });

        ipcRenderer.on('show-settings', () => {
            this.refs.navigator.router.push('/settings');
        });

        ipcRenderer.on('show-messages', () => {
            this.refs.navigator.router.push('/');
        });

        ipcRenderer.on('os-resume', async() => {
            var session = stores.session;

            session.keepalive()
                .catch(ex => session.logout());
        });

        ipcRenderer.on('show-errors', (event, args) => {
            stores.snackbar.showMessage(args.message);
        });
    }

    render() {
        return (
            <Provider {...stores}>
                <Router history={hashHistory} ref="navigator">
                    {getRoutes()}
                </Router>
            </Provider>
        );
    }
}

render(
    <App />,
    document.getElementById('root')
);
