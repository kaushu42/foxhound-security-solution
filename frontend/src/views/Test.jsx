import React, {Component, Fragment} from 'react';
import ReactPolling from 'react-polling';

class Test extends Component {
    render() {
        return (
            <Fragment>
					<ReactPolling
					  url={'https://jsonplaceholder.typicode.com/todos/1'}
					  interval= {3000} // in milliseconds(ms)
					  retryCount={3} // this is optional
					  onSuccess={() => console.log('handle success')}
					  onFailure={() => console.log('handle failure')} // this is optional
					  method={'GET'} />
            </Fragment>
            )
    }

}

export default Test;