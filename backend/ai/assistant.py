"""AI assistant module for mathematical explanations and help."""

import sympy as sp
from backend.engine.symbolic import safe_parse


def explain_step_by_step(expr_str: str, operation: str, variable: str = "x") -> dict:
    """Generate step-by-step explanation for a mathematical operation."""
    var = sp.Symbol(variable)
    expr = safe_parse(expr_str)
    steps = []

    if operation == "differentiate":
        steps = _explain_derivative(expr, var)
    elif operation == "integrate":
        steps = _explain_integral(expr, var)
    elif operation == "solve":
        steps = _explain_solve(expr, var)
    elif operation == "simplify":
        steps = _explain_simplify(expr)

    return {"steps": steps, "operation": operation}


def _explain_derivative(expr, var):
    steps = []
    steps.append({
        "description": "Identify the function to differentiate",
        "latex": f"f({var}) = {sp.latex(expr)}",
    })

    # Check structure
    if expr.is_Add:
        steps.append({
            "description": "Apply the sum rule: derivative of a sum is the sum of derivatives",
            "latex": r"\frac{d}{dx}[f + g] = \frac{df}{dx} + \frac{dg}{dx}",
        })
        for term in expr.args:
            d = sp.diff(term, var)
            steps.append({
                "description": f"Differentiate term: {sp.latex(term)}",
                "latex": f"\\frac{{d}}{{d{var}}}[{sp.latex(term)}] = {sp.latex(d)}",
            })
    elif expr.is_Mul:
        steps.append({
            "description": "Apply the product rule",
            "latex": r"\frac{d}{dx}[f \cdot g] = f'g + fg'",
        })

    result = sp.diff(expr, var)
    simplified = sp.simplify(result)
    steps.append({
        "description": "Compute the full derivative",
        "latex": f"f'({var}) = {sp.latex(result)}",
    })
    if simplified != result:
        steps.append({
            "description": "Simplify",
            "latex": f"f'({var}) = {sp.latex(simplified)}",
        })
    return steps


def _explain_integral(expr, var):
    steps = []
    steps.append({
        "description": "Identify the integrand",
        "latex": f"\\int {sp.latex(expr)} \\, d{var}",
    })
    result = sp.integrate(expr, var)
    steps.append({
        "description": "Apply integration rules",
        "latex": f"= {sp.latex(result)} + C",
    })
    return steps


def _explain_solve(expr, var):
    steps = []
    steps.append({
        "description": "Set the expression equal to zero",
        "latex": f"{sp.latex(expr)} = 0",
    })
    solutions = sp.solve(expr, var)
    for i, sol in enumerate(solutions):
        steps.append({
            "description": f"Solution {i + 1}",
            "latex": f"{var} = {sp.latex(sol)}",
        })
    return steps


def _explain_simplify(expr):
    steps = []
    steps.append({
        "description": "Original expression",
        "latex": sp.latex(expr),
    })
    expanded = sp.expand(expr)
    if expanded != expr:
        steps.append({
            "description": "Expand",
            "latex": sp.latex(expanded),
        })
    simplified = sp.simplify(expr)
    steps.append({
        "description": "Simplified form",
        "latex": sp.latex(simplified),
    })
    return steps


def generate_exercises(topic: str, difficulty: str = "medium", count: int = 5) -> list:
    """Generate practice exercises for a given topic."""
    x = sp.Symbol("x")
    exercises = []

    if topic == "derivatives":
        funcs = {
            "easy": [x**2, 3*x + 1, x**3, sp.sin(x), sp.cos(x)],
            "medium": [x**2 * sp.sin(x), sp.exp(x) * x, sp.log(x) * x**2,
                       sp.tan(x), (x**2 + 1) / (x - 1)],
            "hard": [sp.sin(sp.cos(x)), sp.exp(x**2), sp.log(sp.sin(x)),
                     x**x, sp.atan(x**2)],
        }
        for f in funcs.get(difficulty, funcs["medium"])[:count]:
            ans = sp.diff(f, x)
            exercises.append({
                "problem": f"Find d/dx [{sp.latex(f)}]",
                "problem_latex": f"\\frac{{d}}{{dx}}\\left[{sp.latex(f)}\\right]",
                "answer": sp.latex(ans),
            })

    elif topic == "integrals":
        funcs = {
            "easy": [x**2, 3*x, sp.sin(x), sp.cos(x), sp.exp(x)],
            "medium": [x * sp.exp(x), x * sp.sin(x), 1/(x**2 + 1),
                       sp.log(x), x**2 * sp.cos(x)],
            "hard": [sp.sin(x)**2, 1/sp.sqrt(1 - x**2), sp.exp(-x**2),
                     sp.tan(x), x * sp.log(x)**2],
        }
        for f in funcs.get(difficulty, funcs["medium"])[:count]:
            ans = sp.integrate(f, x)
            exercises.append({
                "problem": f"Compute integral of {sp.latex(f)} dx",
                "problem_latex": f"\\int {sp.latex(f)} \\, dx",
                "answer": sp.latex(ans) + " + C",
            })

    elif topic == "equations":
        eqs = {
            "easy": [x**2 - 4, x**2 - 9, 2*x + 6, x**2 - x - 6, 3*x - 12],
            "medium": [x**3 - 8, x**2 - 2*x - 3, x**4 - 16,
                       sp.sin(x) - sp.Rational(1, 2), x**3 - 6*x**2 + 11*x - 6],
            "hard": [sp.exp(x) - x - 2, x**5 - x - 1, sp.log(x) + x - 3,
                     x**3 + x**2 - 1, sp.sin(x) - x/2],
        }
        for eq in eqs.get(difficulty, eqs["medium"])[:count]:
            sols = sp.solve(eq, x)
            exercises.append({
                "problem": f"Solve: {sp.latex(eq)} = 0",
                "problem_latex": f"{sp.latex(eq)} = 0",
                "answer": ", ".join(sp.latex(s) for s in sols),
            })

    return exercises


def validate_proof_step(claim_latex: str, justification: str) -> dict:
    """Basic proof validation - check if a mathematical claim holds."""
    try:
        expr = safe_parse(claim_latex)
        simplified = sp.simplify(expr)
        is_zero = simplified == 0
        is_true = simplified == True  # noqa: E712
        return {
            "valid": is_zero or is_true,
            "simplified": sp.latex(simplified),
            "note": "Expression simplifies to 0 (identity)" if is_zero else "Could not verify automatically",
        }
    except Exception as e:
        return {"valid": False, "error": str(e)}
