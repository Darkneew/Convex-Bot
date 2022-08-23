const getNextPrimes = (n, lowerLimit) => {
    primes = [];
    answer = [];
    num = 0;
    i = 1;
    while (num < n) {
        i++;
        let isPrime = true;
        primes.forEach(p => { if (i % p == 0) isPrime = false });
        if (!isPrime) continue;
        primes.push(i);
        if (i > lowerLimit) {
            answer.push(i % lowerLimit);
            num++;
        }
    }
    return answer;
}

const getNRandomNumbers = (n, seed, lowerLimit) => {
    let factors = getNextPrimes(n * seed.length, lowerLimit);
    numbers = [];
    for (let i = 0; i < n; i++) {
        numbers[i] = 0;
        for (let j = 0; j < seed.length; j++) numbers[i] += factors[i * seed.length + j] * seed.charCodeAt(j);
    }
    return numbers;
}

const randomUniqueList = (limit, size, seed) => {
    let isAvailable = [];
    for (let i = 0; i < limit; i++) isAvailable[i] = true;
    rawNums = getNRandomNumbers(size, seed, limit);
    let nums = [];
    for (let i = 0; i < size; i++) {
        let k = rawNums[i] % (limit - i);
        let num = 0;
        let j = 0;
        while (j < k) {
            num ++;
            if (isAvailable[num]) j++;
        }
        nums[i] = num;
        isAvailable[num] = false;
    }
    return nums;
}

module.exports.generateInterkey = (privateKey, password) => {
    let splitupKey = privateKey.split("");
    if (password.length <= privateKey.length) {
        let permList = randomUniqueList(privateKey.length, password.length, password);
        for (let i = 0; i < password.length; i++) {
            splitupKey[permList[i]] = String.fromCharCode(splitupKey[permList[i]].charCodeAt(0) + password.charCodeAt(i));
        }
    } else {
        let permList = randomUniqueList(password.length, privateKey.length, password);
        for (let i = 0; i < privateKey.length; i++) {
            splitupKey[i] = String.fromCharCode(splitupKey[i].charCodeAt(0) + password.charCodeAt(permList[i]));
        }
    }
    return splitupKey.join("");
}

module.exports.getPrivateKey = (interkey, password) => {
    let splitupKey = interkey.split("");
    if (password.length <= interkey.length) {
        let permList = randomUniqueList(interkey.length, password.length, password);
        for (let i = 0; i < password.length; i++) {
            splitupKey[permList[i]] = String.fromCharCode(splitupKey[permList[i]].charCodeAt(0) - password.charCodeAt(i));
        }
    } else {
        let permList = randomUniqueList(password.length, interkey.length, password);
        for (let i = 0; i < interkey.length; i++) {
            splitupKey[i] = String.fromCharCode(splitupKey[i].charCodeAt(0) - password.charCodeAt(permList[i]));
        }
    }
    return splitupKey.join("");
}

module.exports.hexToBytes = (hex) => {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return new Uint8Array(bytes);
}