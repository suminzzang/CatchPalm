import React, { Component } from 'react';
import OpenViduVideoComponent from './OvVideo';
import './UserVideo.css';

export default class UserVideoComponent extends Component {

    getNicknameTag() {
        // Gets the nickName of the user
        return JSON.parse(this.props.streamManager.stream.connection.data).clientData;
    }

    render() {
        return (
            <div>
                {this.props.streamManager !== undefined ? (
                    <div class="card">
                    <OpenViduVideoComponent streamManager={this.props.streamManager} />
                    <p className='nickName'>{this.getNicknameTag()}</p>
                    </div>
                ) : null}
            </div>
        );
    }
}
