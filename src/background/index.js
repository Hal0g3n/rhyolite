import { runtime, tabs, windows } from "webextension-polyfill";

// A mutex to prevent race conditions on tab changes
// https://stackoverflow.com/questions/51086688/mutex-in-javascript-does-this-look-like-a-correct-implementation
function Mutex() {
	let current = Promise.resolve();
	this.lock = () => {
		let _resolve;
		const p = new Promise((resolve) => {
			_resolve = () => resolve();
		});
		// Caller gets a promise that resolves when the current outstanding
		// lock resolves
		const rv = current.then(() => _resolve);
		// Don't allow the next request until the new promise is done
		current = p;
		// Return the new promise
		return rv;
	};
}

const mutexOnTabChange = new Mutex();
/**
 * Called on any tab changes, ensures each window has the pinned tab
 * @param {any[]} args - The arguments for each callback, ignored as the function does the same thing
 */
async function onTabChange(...args) {
	const unlock = await mutexOnTabChange.lock();

	windows
		.getAll({ populate: true })
		.then(async (all_windows) => {
			// Loop through every window to ensure that the main tab can be found
			for (const window of all_windows) {
				if (!window.tabs) continue; // shaddap ts checker

				// Sort the tabs by index
				window.tabs.sort((a, b) => a.index - b.index);

				let index = -1;
				for (const tab of window.tabs) {
					// No url or the tab is not created by the extension
					// It is not our tab to find
					if (
						!tab.pendingUrl?.includes(runtime.id) &&
						!tab.url?.includes(runtime.id)
					)
						continue;

					index = tab.index;
					break;
				}

				// Found index: Move to first tab and pin
				if (index !== -1) {
					// await tabs.update(window.tabs[index].id, { pinned: true });

					// Keep trying until you successfully move the tab
					// https://stackoverflow.com/questions/25460665/how-to-know-when-dragging-a-tab-has-finished
					while (true) {
						try {
							await tabs.move(window.tabs[index].id, { index: 0 });
							break;
						} catch {}
					}
				} else {
					// No tab found, creating...
					await tabs.create({
						index: 0,
						url: "./pinned.html",
						pinned: true,
						windowId: window.id,
						active: false,
					});
				}
			}
		})
		.finally(unlock);
}

// List of actions to consider
tabs.onCreated.addListener(onTabChange);
tabs.onUpdated.addListener(onTabChange);
tabs.onDetached.addListener(onTabChange);
tabs.onRemoved.addListener(onTabChange);
tabs.onMoved.addListener(onTabChange);

// Initialization call
onTabChange();

export {};
