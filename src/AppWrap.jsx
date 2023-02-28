import React from 'react';
import App from './App';

export default class AppWrap extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            error: null,
        }
    }

    componentDidCatch (error) {
        this.setState({ error });
    }

    render () {
        if (this.state.error) {
            return <p>Error: { this.state.error.message }</p>;
        }

        return <App />;
    }
}