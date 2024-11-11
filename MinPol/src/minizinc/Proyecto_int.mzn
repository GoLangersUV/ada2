%-------------------------------------------------------------------------------
% File: Proyecto.mzn
% Authors: Julián Ernesto Puyo Mora...2226905
%          Cristian David Pacheco.....2227437
%          Juan Sebastián Molina......2224491
%          Juan Camilo Narváez Tascón.2140112
% Creation date: 05/10/2024
% Last modification: 09/10/2024
% License: GNU-GPL
%-------------------------------------------------------------------------------
% Warning: Consulte el informe técnico para una descripción detallada del modelo.

%-------------------------------------------------------------------------------
% Parámetros generales del modelo
%-------------------------------------------------------------------------------
% Definición 1.1
int: n; 
int: m;
array[1..m] of int: v;  % Changed from float to int
array[1..m] of int: p;

% Definición 1.5
array[1..m, 1..m] of int: C;  % Changed from float to int
array[1..m] of int: ce;  % Changed from float to int

% Definición 1.6
array[1..m] of 0..1: is_empty = [if p[j] == 0 then 1 else 0 endif | j in 1..m];

%-------------------------------------------------------------------------------
% 1.1 Variables del modelo
%-------------------------------------------------------------------------------
% Definición 1.8
array[1..m, 1..m] of var 0..n: X;
array[1..m] of var 0..n: p_prime;

% Definición 1.9
array[1..m] of var 0..1: is_median;

% Definición 1.11
var int: median_v = sum(i in 1..m)(v[i] * is_median[i]);  % Changed from float to int
var int: total_cost = sum(i in 1..m, j in 1..m)(
    (C[i,j] * (1 + p[i] div n) + ce[j] * is_empty[j]) * X[i,j]
);
var int: polarization = sum(i in 1..m)(
    p_prime[i] * abs(v[i] - median_v)
);

%-------------------------------------------------------------------------------
% 1.2 Sistema de restricciones
%-------------------------------------------------------------------------------
% Restricción 1.12
constraint forall(i in 1..m)(
    p_prime[i] = p[i] + sum(k in 1..m)(X[k,i]) - sum(k in 1..m)(X[i,k])
);

% Restricción 1.13
constraint forall(i in 1..m)(
    sum(j in 1..m)(X[i,j]) <= p[i]
);

% Restricción 1.14
int: M_max;
constraint sum(i in 1..m, j in 1..m)(
    abs(j - i) * X[i,j]
) <= M_max;

% Restricción 1.15
int: C_max;  % Changed from float to int
constraint total_cost <= C_max;

% Restricción 1.16
constraint sum(i in 1..m)(is_median[i]) = 1;

% Restricción 1.17
constraint forall(i in 1..m)(
    is_median[i] = 1 -> (
        (i = 1 \/ sum(j in 1..i-1)(p_prime[j]) < n div 2) /\
        sum(j in 1..i)(p_prime[j]) >= n div 2
    )
);

%-------------------------------------------------------------------------------
% 1.3 Formulación del modelo
%-------------------------------------------------------------------------------
solve minimize polarization;

%-------------------------------------------------------------------------------
% Output formatting
%-------------------------------------------------------------------------------
output [
  "Optimal Solution:\n",
  "---------------\n",
  "Polarization = \(polarization/1000)\n",
  "Median = \(median_v/1000)\n\n",
  "Movements (from -> to : amount):\n"
] ++
[
  if fix(X[i,j]) > 0 then
    "  \(i) -> \(j) : \(X[i,j])\n"
  else ""
  endif
  | i,j in 1..m
] ++
[
  "\nFinal distribution:\n",
  "Opinion\tValue\tPopulation\tInitially Empty?\n"
] ++
[
  "\(i)\t\(v[i]/1000)\t\(p_prime[i])\t\(if is_empty[i]==1 then "Yes" else "No" endif)\n"
  | i in 1..m
] ++
[
  "\nTotal cost: \(total_cost/1000)\n",
  "Total movements: \(sum(i,j in 1..m)(X[i,j]))\n"
];