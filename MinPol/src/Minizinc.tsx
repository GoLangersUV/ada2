import  { useState } from 'react';

const ExampleComponent = () => {
    const [result, setResult] = useState('');

    const runMiniZinc = async () => {
        const model = `
            % Your MiniZinc model here
            int: n;
            array[1..n] of int: a;
            solve satisfy;
        `;

        const data = `
            n = 5;
            a = [1, 2, 3, 4, 5];
        `;

        try {
            const response = await fetch('http://localhost:3000/run-minizinc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ model, data }),
            });

            const output = await response.text();
            setResult(output);
        } catch (error) {
            console.error('Error running MiniZinc:', error);
        }
    };

    return (
        <div>
            <button onClick={runMiniZinc}>Run MiniZinc</button>
            <pre>{result}</pre>
        </div>
    );
};

export default ExampleComponent;
