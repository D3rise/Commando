const ArgumentType = require('./base');

class IntegerArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'integer');
	}

	validate(val, msg, arg) {
		const int = Number.parseInt(val);
		if(Number.isNaN(int)) return false;
		if(arg.oneOf && !arg.oneOf.includes(int)) return false;
		if(arg.min !== null && typeof arg.min !== 'undefined' && int < arg.min) {
			return `Пожалуйста, укажите значение, равное или большее ${arg.min}.`;
		}
		if(arg.max !== null && typeof arg.max !== 'undefined' && int > arg.max) {
			return `Пожалуйста, укажите значение, равное или меньшее ${arg.max}.`;
		}
		return true;
	}

	parse(val) {
		return Number.parseInt(val);
	}
}

module.exports = IntegerArgumentType;
