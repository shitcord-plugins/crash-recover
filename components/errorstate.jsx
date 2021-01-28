import {get} from "@vizality/http";
import {joinClassNames} from "@vizality/util/dom";
import {getModule} from "@vizality/webpack";
import React from "react";
import url from "url";
/*
* The code was used from Vizality's errorboundary component, full credits go to @dperolio
*/


const classes = {
	...getModule("scrollerBase", "thin")
}

const ReactInvariants = (async () => {
	return JSON.parse((await get("https://raw.githubusercontent.com/facebook/react/master/scripts/error-codes/codes.json")).body.toString());
})();
const RE_INVARIANT_URL = /https?:\/\/reactjs\.org\/docs\/error-decoder\.html\?invariant=([0-9]+)(?:[^ ])+/;

export default function ErrorState({error, stack, plugin}) {
	const [codes, setCodes] = React.useState(null);
	if (!codes) {
		ReactInvariants.then(setCodes);
		return null;
	} 
	const componentStack = stack.split("\n").slice(1, 7).join("\n");

	var errorStack;
	if (RE_INVARIANT_URL.test(error.stack)) {
		const uri = url.parse(RE_INVARIANT_URL.exec(error.stack)[0], true);
		const code = uri.query.invariant;
		const args = uri.query["args[]"] ? (Array.isArray(uri.query["args[]"]) ? uri.query["args[]"] : [uri.query["args[]"]]) : [];

		errorStack = `React Invariant Violation #${code}\n${uri.format(codes[code], ...args)}`;
	}

	return <div className="vz-error-boundary">
		{plugin.settings.get("showMessage", true) && <>
			<div className="vz-error-boundary-text">An error occured while rendering the page:</div>
			<div className={joinClassNames("vz-error-boundary-block", "vz-error-boundary-error-stack", classes.thin)}>{errorStack}</div>
		</>}
		{plugin.settings.get("showStack", true) && <>
			<div className="vz-error-boundary-text">Component stack:</div>
			<div className={joinClassNames("vz-error-boundary-component-stack", "vz-error-boundary-block", classes.thin)}>{componentStack}</div>
		</>}
	</div>
}