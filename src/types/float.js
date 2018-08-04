const ArgumentType = require('./base');

class FloatArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'float');
	}

	validate(val, msg, arg) {
		const float = Number.parseFloat(val);
		if(Number.isNaN(float)) return false;
		if(arg.oneOf && !arg.oneOf.includes(float)) return false;
		if(arg.min !== null && typeof arg.min !== 'undefined' && float < arg.min) {
			return `Пожалуйста, укажите значение, равное или большее ${arg.min}.`;
		}
		if(arg.max !== null && typeof arg.max !== 'undefined' && float > arg.max) {
			return `Пожалуйста, укажите значение, равное или меньшее ${arg.max}.`;
		}
		return true;
	}

	parse(val) {
		return Number.parseFloat(val);
	}
}

module.exports = FloatArgumentType;
