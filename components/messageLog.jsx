import React from "react";
import {joinClassNames} from "@vizality/util/dom";
import {getModule} from "@vizality/webpack";

const classes = getModule("scrollerBase", "thin");

export default class MessageLog extends React.Component {
	state = {
		logs: this.props.logs
	}

	render() {
		return <div className={joinClassNames("message-log", classes.thin)}>{this.state.logs.map(e => <div class="error-message">{e}</div>)}</div>;
	}
}