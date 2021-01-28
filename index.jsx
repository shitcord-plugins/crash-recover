import {Plugin} from "@vizality/entities";
import {patch, unpatch} from "@vizality/patcher";
import {getModule, getModuleByDisplayName, FluxDispatcher} from "@vizality/webpack";
import {Button} from "@vizality/components";
import React from "react";

const ContextMenuActions = getModule("closeContextMenu");
const ModalStack = getModule("popAll", "push");
const LayerManager = getModule("popAllLayers");
const PopoutStack = getModule("closeAll");
const ModalActions = getModule("openModal");
const NavigationUtils = getModule("transitionTo");

export default class CrashRecover extends Plugin {
	timesCrashed = 0;

	start() {
		this.injectStyles("style.css");

		const ErrorBoundary = getModuleByDisplayName("ErrorBoundary");
		
		const self = this;

		const timesCrashed = val => {
			if (typeof val == "undefined") return this.timesCrashed;
			return this.timesCrashed = val;
		}

		patch("crash-recover", ErrorBoundary.prototype, "render", function (_, ret) {
			if (!this.state.error) {
				if(timesCrashed()) timesCrashed(0);
				return ret;
			}

			ret.props.action = <div className="errorBoundary-body">
				<div className="errorBoundary-flex">
					<Button size={Button.Sizes.LARGE} onClick={() => self.onCrash(state => this.setState(state))}>Recover</Button>
					<Button size={Button.Sizes.LARGE} onClick={() => location.reload()}>Reload</Button>
					<Button size={Button.Sizes.LARGE} onClick={() => vizality.manager.plugins.disableAll()}>Disable All Plugins</Button>
				</div>
				{!timesCrashed() && <div className="recoverText">Attempting to Recover</div>}
			</div>;

			if (self.settings.get("immediately", false)) self.onCrash(state => this.setState(state));
			else setTimeout(() => {
				self.onCrash(state => this.setState(state));
			}, 2500);

			return ret;
		});
	}

	closeEverything() {
		return new Promise(resolve => {
			FluxDispatcher.wait(() => {
				try {
					ContextMenuActions.closeContextMenu();
				} catch {}

				try {
					ModalStack.popAll();
				} catch {}

				try {
					LayerManager.popAllLayers();
				} catch {}

				try {
					PopoutStack.closeAll();
				} catch {}

				try {
					ModalActions.useModalsStore.setState(() => ({default: []}));
				} catch {}

				try {
					if (this.timesCrashed > 4) NavigationUtils.transitionTo("/channels/@me");
				} catch {}

				resolve();
			});
		});
	}

	async onCrash(tryRecover) {
		await this.closeEverything();
		this.timesCrashed++;
		tryRecover({info: null, error: null});
	}

	stop() {
		unpatch("crash-recover");
	}
}