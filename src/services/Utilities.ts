class Utilities {
    constructor() { }

    ConvertCelsiusToFahrenheit = function (celsius: number) {
        return (celsius * 9 / 5) + 32;
    };

    ConvertMetersPerSecondToMilesPerHour = function (speed: number) {
        return speed * 2.23694;
    };

    ConvertKilometersPerHourToMilesPerHour = function (speed: number) {
        return speed / 1.609;
    };

    GetCircularReplacer = () => {
        const seen = new WeakSet();
        return (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return;
                }
                seen.add(value);
            }
            return value;
        };
    };
}

export default new Utilities();
