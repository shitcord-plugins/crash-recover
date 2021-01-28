import {Plugin} from "@vizality/entities";
import {patch, unpatch} from "@vizality/patcher";
import {getModule, getModuleByDisplayName, FluxDispatcher} from "@vizality/webpack";
import React from "react";
import ErrorState from "./components/errorstate";
import PanelButton from "./components/panelbutton";
import Emergency from "./components/icons/emergency";
import Reload from "./components/icons/reload";
import Addon from "./components/icons/addon";
import MessageLog from "./components/messageLog";
import Home from "./components/icons/home";

const ContextMenuActions = getModule("closeContextMenu");
const ModalStack = getModule("popAll", "push");
const LayerManager = getModule("popAllLayers");
const PopoutStack = getModule("closeAll");
const ModalActions = getModule("openModal");
const NavigationUtils = getModule("transitionTo");

export default class CrashRecover extends Plugin {
	timesCrashed = 0;
	logs = [];

	start() {
		this.injectStyles("style.scss");

		const ErrorBoundary = getModuleByDisplayName("ErrorBoundary");
		
		const self = this, logRef = React.createRef();

		const timesCrashed = val => {
			if (typeof val == "undefined") return this.timesCrashed;
			return this.timesCrashed = val;
		}

		const logs = val => {
			if (typeof val == "undefined") return this.logs;
			return this.logs = val;
		}

		var disabledAllPlugins = false, didNotice = false;

		const writeLog = text => {
			const time = new Date().toLocaleTimeString();
			this.logs.push(`[${time.slice(0, time.lastIndexOf(":"))}] ${text}`);
			logRef?.current?.setState({logs: logs()});
		}


		patch("crash-recover", ErrorBoundary.prototype, "render", function (_, ret) {
			if (!this.state.error) {
				setTimeout(() => {
					if (!this.state.error && timesCrashed()) {
						timesCrashed(0);
						logs([]);
						self.log("Successfully recovered from crash.");
					}
				}, 1000);
				return ret;
			} else if (timesCrashed()) {
				writeLog("No success.");
			}

			const onRecover = () => {
				writeLog(timesCrashed() ? "Trying again..." : "Attempt to recover...");
				setTimeout(() => self.onCrash(state => this.setState(state)), self.settings.get("immediately", false) ? 0 : 500)
			}
			const onReload = () => {
				writeLog("Reloading...");
				setTimeout(() => location.reload(), 500);
			}
			const onDisablePlugins = () => {
				writeLog("Disabling Plugins...");
				disabledAllPlugins = true;
				vizality.manager.plugins.disableAll();
			}
			if (!timesCrashed()) writeLog("Detected crash...");
			ret.props.action = <div className="errorBoundary-body">
				<div className="errorBoundary-panel left">
				<div className="headerText">Repair Options:</div>
					<PanelButton label="Recover" onClick={onRecover} icon={<Emergency className="errorBoundary-icon" />} />
					<PanelButton label="Reload" onClick={onReload} icon={<Reload className="errorBoundary-icon" />} />
					<PanelButton disabled={disabledAllPlugins} label="Disable All Plugins" onClick={onDisablePlugins} icon={<Addon className="errorBoundary-icon" />} />
					<PanelButton disabled={location.href.indexOf("@me") > -1} label="Go to Home" onClick={() => (self.toTome(), this.forceUpdate())} icon={<Home className="errorBoundary-icon" />} />
				</div>
				<ErrorState error={this.state.error} stack={this.state.info.componentStack} plugin={self} />
				<div className="errorBoundary-panel right">
					<div className="headerText">Crash Recover log: #{timesCrashed()}</div>
					<MessageLog logs={logs()} ref={logRef} />
				</div>
			</div>;
			if (self.settings.get("auto", true) && timesCrashed() >= self.settings.get("times", 5)) {
				if (!didNotice) {
					writeLog("Max. tries reached... You can either 'Go To Home' or 'Disable All Plugins'");	
					didNotice = true;
				}
				return ret;
			}
			if (self.settings.get("immediately", false) && self.settings.get("auto", true)) onRecover();
			else if(self.settings.get("auto", true)) setTimeout(onRecover, self.settings.get("delay", 3) * 1000);
			return ret;
		});
	}

	closeEverything() {
		return new Promise(resolve => {
			FluxDispatcher.wait(() => {
				const failed = [];
				try {
					ContextMenuActions.closeContextMenu();
				} catch {
					failed.push("Close ContextMenus");
				}

				try {
					ModalStack.popAll();
				} catch {
					failed.push("Close Modals from ModalStack");
				}

				try {
					LayerManager.popAllLayers();
				} catch {
					failed.push("Close All Layers");
				}

				try {
					PopoutStack.closeAll();
				} catch {
					failed.push("Close All Popouts");
				}

				try {
					ModalActions.useModalsStore.setState(() => ({default: []}));
				} catch {
					failed.push("Close All Modals from ModalsApi");
				}
				if (failed.length) this.error(`Failed to executing the following ${failed.length > 1 ? "commands" : "command"}: ${failed.join(", ")}`);

				resolve();
			});
		});
	}

	toTome() {
		NavigationUtils.transitionTo("/channels/@me");
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