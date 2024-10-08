document.addEventListener('DOMContentLoaded', function () {

    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const sequenceInput = document.getElementById('sequence');
    const greenInput = document.getElementById('greenInterval');
    const yellowInput = document.getElementById('yellowInterval');

    const signals = {
        A: document.getElementById('signalA'),
        B: document.getElementById('signalB'),
        C: document.getElementById('signalC'),
        D: document.getElementById('signalD')
    };

    let intervalId;

    function validateInputs() {
        const sequence = sequenceInput.value.split(',');
        const greenInterval = parseInt(greenInput.value) * 1000;
        const yellowInterval = parseInt(yellowInput.value) * 1000;

        if (!sequence.every(sig => ['A', 'B', 'C', 'D'].includes(sig))) {
            alert('Invalid sequence. Please use A, B, C, D.');
            return false;
        }

        return { sequence, greenInterval, yellowInterval };
    }

    // Save data to the server
    function saveData() {
        const data = validateInputs();
        if (!data) return;

        fetch('/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sequence: sequenceInput.value,
                yellowInterval: yellowInput.value,
                greenInterval: greenInput.value
            })
        })
        .then(response => response.json())
        .then(data => console.log('Data saved successfully:', data))
        .catch(err => console.error('Error:', err));
    }

    // Load data from the server
    function loadData() {
        fetch('/load')
            .then(response => response.json())
            .then(data => {
                if (data) {
                    sequenceInput.value = data.sequence;
                    yellowInput.value = data.yellow_interval;
                    greenInput.value = data.green_interval;
                }
            })
            .catch(err => console.error('Error:', err));
    }

    function startSignals() {
        const { sequence, greenInterval, yellowInterval } = validateInputs();
        if (!sequence) return;

        let currentSignalIndex = 0;

        function changeSignal() {
            Object.keys(signals).forEach(sig => signals[sig].className = 'signal red');

            const currentSignal = sequence[currentSignalIndex];
            signals[currentSignal].className = 'signal green';

            setTimeout(() => {
                signals[currentSignal].className = 'signal yellow';
            }, greenInterval - yellowInterval);

            currentSignalIndex = (currentSignalIndex + 1) % sequence.length;
        }

        intervalId = setInterval(changeSignal, greenInterval);
        changeSignal();
    }

    function stopSignals() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
            Object.keys(signals).forEach(sig => signals[sig].className = 'signal red');
        }
    }

    startButton.addEventListener('click', () => {
        startSignals();
        saveData();
    });

    stopButton.addEventListener('click', stopSignals);

    loadData();
});
