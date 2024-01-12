import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            error: /** @type {Error?} */(null),
        }
    }

    componentDidCatch (error) {
        // console.log(error);
        this.setState({ error });
    }

    render () {
        if (this.state.error) {
            return <p>Error: { this.state.error.message }</p>;
        }

        return this.props.children;
    }
}