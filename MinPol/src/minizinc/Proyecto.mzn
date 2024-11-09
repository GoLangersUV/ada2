% Parámetros
int: n; % Número total de personas
int: m; % Número de opiniones posibles

array[1..m] of int: p; % Distribución inicial de personas (sorted)
array[1..m] of float: v; % Valores de las opiniones (sorted)

array[1..m, 1..m] of float: c; % Costos base de mover de i a j
array[1..m] of float: ce; % Costos extra al mover a opiniones vacías

float: ct; % Costo total máximo permitido
int: maxM; % Número máximo de movimientos

% Precompute array indicating positions with people (1 if empty, 0 if has people)
array[1..m] of 0..1: is_empty = [if p[j] == 0 then 1 else 0 endif | j in 1..m];

% Variables de decisión
array[1..m, 1..m] of var 0..n: x; % Personas movidas de i a j

% Variables auxiliares
array[1..m] of var 0..n: p_prime; % Distribución final de personas

% Cálculo de p_prime
constraint forall(i in 1..m)(
    p_prime[i] = p[i] + sum(k in 1..m)(x[k,i]) - sum(k in 1..m)(x[i,k])
);

% Restricción de capacidad de movimiento
constraint forall(i in 1..m)(
    sum(j in 1..m)(x[i,j]) <= p[i]
);

% Cálculo del costo total (optimizado)
var float: total_cost = sum(i in 1..m, j in 1..m)(
    (c[i,j] * (1 + p[i]/n) + ce[j] * is_empty[j]) * x[i,j]
);

constraint total_cost <= ct;

% Número total de movimientos
constraint sum(i in 1..m, j in 1..m)(
    abs(j - i) * x[i,j]
) <= maxM;

% Variables para encontrar la mediana
array[1..m] of var 0..1: is_median;

% Solo una posición puede ser la mediana
constraint sum(i in 1..m)(is_median[i]) = 1;

% La posición de la mediana debe cumplir las condiciones necesarias
constraint forall(i in 1..m)(
    is_median[i] = 1 -> (
        (i = 1 \/ sum(j in 1..i-1)(p_prime[j]) < n/2.0) /\
        sum(j in 1..i)(p_prime[j]) >= n/2.0
    )
);

% La mediana es el producto punto entre los valores y los indicadores
var float: median_v = sum(i in 1..m)(v[i] * is_median[i]);

% Cálculo de la polarización
var float: polarization = sum(i in 1..m)(
    p_prime[i] * abs(v[i] - median_v)
);

% Output formatting
output [
  "Optimal Solution:\n",
  "---------------\n",
  "Polarization = \(polarization)\n",
  "Median = \(median_v)\n\n",
  "Movements (from -> to : amount):\n"
] ++
[
  if fix(x[i,j]) > 0 then
    "  \(i) -> \(j) : \(x[i,j])\n"
  else ""
  endif
  | i,j in 1..m
] ++
[
  "\nFinal distribution:\n",
  "Opinion\tValue\tPopulation\tInitially Empty?\n"
] ++
[
  "\(i)\t\(v[i])\t\(p_prime[i])\t\(if is_empty[i]==1 then "Yes" else "No" endif)\n"
  | i in 1..m
] ++
[
  "\nTotal cost: \(total_cost)\n",
  "Total movements: \(sum(i,j in 1..m)(x[i,j]))\n"
] ++
[
  "\nOptimal Solution = \(polarization)\n",
];

solve minimize polarization;