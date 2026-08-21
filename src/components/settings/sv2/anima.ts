import * as anima from 'animalang';
import { type Closure } from 'animalang';

/**
 * Shared Anima engine used to evaluate settings-v2 form `Branch` conditions.
 *
 * Conditions are deterministic strings, so compiled closures are cached across
 * every form instance (willow caches per-component; a shared cache is safe and
 * avoids recompiling the same expression repeatedly).
 */
export const branchEngine = new anima.Anima(anima.implRvm);

const closureCache = new Map<string, Closure>();

export const getClosure = (cond: string): Closure => {
	let closure = closureCache.get(cond);
	if (!closure) {
		closure = branchEngine.compileToClosure(
			cond,
			[Symbol.for('props'), Symbol.for('id')],
			branchEngine.scope
		);
		closureCache.set(cond, closure);
	}
	return closure;
};
