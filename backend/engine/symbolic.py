"""Symbolic mathematics engine powered by SymPy."""

import sympy as sp
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application,
    convert_xor,
)

TRANSFORMATIONS = standard_transformations + (
    implicit_multiplication_application,
    convert_xor,
)


def safe_parse(expr_str: str) -> sp.Expr:
    """Parse a string expression into a SymPy expression."""
    return parse_expr(expr_str, transformations=TRANSFORMATIONS)


def solve_equation(equation_str: str, variable: str = "x") -> dict:
    """Solve an equation. Use '=' for equations, otherwise solves expr = 0."""
    var = sp.Symbol(variable)
    if "=" in equation_str:
        left, right = equation_str.split("=", 1)
        expr = safe_parse(left.strip()) - safe_parse(right.strip())
    else:
        expr = safe_parse(equation_str)

    solutions = sp.solve(expr, var)
    steps = [
        f"Given: {equation_str}",
        f"Solving for {variable}",
        f"Expression: {sp.pretty(expr)} = 0",
        f"Solutions: {solutions}",
    ]
    return {
        "solutions": [str(s) for s in solutions],
        "latex": [sp.latex(s) for s in solutions],
        "steps": steps,
    }


def differentiate(expr_str: str, variable: str = "x", order: int = 1) -> dict:
    """Compute the derivative of an expression."""
    var = sp.Symbol(variable)
    expr = safe_parse(expr_str)
    result = sp.diff(expr, var, order)
    return {
        "input": sp.latex(expr),
        "result": str(result),
        "latex": sp.latex(result),
        "simplified": sp.latex(sp.simplify(result)),
        "steps": [
            f"f({variable}) = {sp.latex(expr)}",
            f"d/d{variable} applied {order} time(s)",
            f"f'({variable}) = {sp.latex(result)}",
        ],
    }


def integrate(expr_str: str, variable: str = "x", lower: str = None, upper: str = None) -> dict:
    """Compute the integral of an expression (definite or indefinite)."""
    var = sp.Symbol(variable)
    expr = safe_parse(expr_str)

    if lower is not None and upper is not None:
        a = safe_parse(lower)
        b = safe_parse(upper)
        result = sp.integrate(expr, (var, a, b))
        steps = [
            f"Integrand: {sp.latex(expr)}",
            f"Bounds: [{sp.latex(a)}, {sp.latex(b)}]",
            f"Result: {sp.latex(result)}",
        ]
    else:
        result = sp.integrate(expr, var)
        steps = [
            f"Integrand: {sp.latex(expr)}",
            f"Indefinite integral w.r.t. {variable}",
            f"Result: {sp.latex(result)} + C",
        ]

    return {
        "result": str(result),
        "latex": sp.latex(result),
        "steps": steps,
    }


def simplify_expr(expr_str: str) -> dict:
    """Simplify a mathematical expression."""
    expr = safe_parse(expr_str)
    simplified = sp.simplify(expr)
    expanded = sp.expand(expr)
    factored = sp.factor(expr)
    return {
        "original": sp.latex(expr),
        "simplified": sp.latex(simplified),
        "expanded": sp.latex(expanded),
        "factored": sp.latex(factored),
    }


def compute_limit(expr_str: str, variable: str = "x", point: str = "oo") -> dict:
    """Compute a limit."""
    var = sp.Symbol(variable)
    expr = safe_parse(expr_str)
    pt = sp.oo if point == "oo" else safe_parse(point)
    result = sp.limit(expr, var, pt)
    return {
        "result": str(result),
        "latex": sp.latex(result),
        "steps": [
            f"lim({variable} -> {point}) of {sp.latex(expr)}",
            f"= {sp.latex(result)}",
        ],
    }


def series_expansion(expr_str: str, variable: str = "x", point: str = "0", order: int = 6) -> dict:
    """Compute Taylor/Maclaurin series expansion."""
    var = sp.Symbol(variable)
    expr = safe_parse(expr_str)
    pt = safe_parse(point)
    result = sp.series(expr, var, pt, order)
    return {
        "result": str(result),
        "latex": sp.latex(result),
    }


def solve_ode(equation_str: str, func_name: str = "y", variable: str = "x") -> dict:
    """Solve an ordinary differential equation."""
    var = sp.Symbol(variable)
    f = sp.Function(func_name)

    # Replace common ODE notation
    eq_str = equation_str.replace(f"{func_name}''", f"Derivative({func_name}({variable}), {variable}, 2)")
    eq_str = eq_str.replace(f"{func_name}'", f"Derivative({func_name}({variable}), {variable})")
    eq_str = eq_str.replace(f"{func_name}", f"{func_name}({variable})")

    expr = safe_parse(eq_str)
    eq = sp.Eq(expr, 0)
    solution = sp.dsolve(eq, f(var))

    return {
        "result": str(solution),
        "latex": sp.latex(solution),
    }


def matrix_operations(matrix_data: list, operation: str) -> dict:
    """Perform matrix operations: det, inv, eigenvals, rref, transpose."""
    M = sp.Matrix(matrix_data)
    results = {"matrix_latex": sp.latex(M)}

    if operation == "determinant":
        det = M.det()
        results["result"] = str(det)
        results["latex"] = sp.latex(det)
    elif operation == "inverse":
        inv = M.inv()
        results["result"] = str(inv)
        results["latex"] = sp.latex(inv)
    elif operation == "eigenvalues":
        eigvals = M.eigenvals()
        results["result"] = str(eigvals)
        results["latex"] = sp.latex(eigvals)
    elif operation == "rref":
        rref, pivots = M.rref()
        results["result"] = str(rref)
        results["latex"] = sp.latex(rref)
        results["pivots"] = list(pivots)
    elif operation == "transpose":
        T = M.T
        results["result"] = str(T)
        results["latex"] = sp.latex(T)

    return results


def generate_plot_data(expr_str: str, variable: str = "x",
                       x_min: float = -10, x_max: float = 10, points: int = 500) -> dict:
    """Generate plot data for a 2D function."""
    import numpy as np

    var = sp.Symbol(variable)
    expr = safe_parse(expr_str)
    f_lambdified = sp.lambdify(var, expr, modules=["numpy"])

    x_vals = np.linspace(x_min, x_max, points)
    try:
        y_vals = f_lambdified(x_vals)
        y_vals = np.where(np.isfinite(y_vals), y_vals, None)
    except Exception:
        y_vals = [None] * points

    return {
        "x": x_vals.tolist(),
        "y": [float(v) if v is not None and np.isfinite(v) else None for v in y_vals],
        "latex": sp.latex(expr),
    }
