"""API routes for EulerSpace."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from backend.engine.symbolic import (
    solve_equation, differentiate, integrate, simplify_expr,
    compute_limit, series_expansion, solve_ode, matrix_operations,
    generate_plot_data,
)
from backend.physics.simulator import (
    projectile_motion, simple_harmonic_motion, pendulum,
    wave_equation_1d, electric_field_2d, orbital_mechanics,
)
from backend.ai.assistant import (
    explain_step_by_step, generate_exercises, validate_proof_step,
)

router = APIRouter()


# ── Math Engine ──────────────────────────────────────────────

class SolveRequest(BaseModel):
    equation: str
    variable: str = "x"

class DiffRequest(BaseModel):
    expression: str
    variable: str = "x"
    order: int = 1

class IntegralRequest(BaseModel):
    expression: str
    variable: str = "x"
    lower: Optional[str] = None
    upper: Optional[str] = None

class SimplifyRequest(BaseModel):
    expression: str

class LimitRequest(BaseModel):
    expression: str
    variable: str = "x"
    point: str = "oo"

class SeriesRequest(BaseModel):
    expression: str
    variable: str = "x"
    point: str = "0"
    order: int = 6

class ODERequest(BaseModel):
    equation: str
    func_name: str = "y"
    variable: str = "x"

class MatrixRequest(BaseModel):
    matrix: list
    operation: str

class PlotRequest(BaseModel):
    expression: str
    variable: str = "x"
    x_min: float = -10
    x_max: float = 10
    points: int = 500


@router.post("/math/solve")
async def api_solve(req: SolveRequest):
    try:
        return solve_equation(req.equation, req.variable)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/math/differentiate")
async def api_differentiate(req: DiffRequest):
    try:
        return differentiate(req.expression, req.variable, req.order)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/math/integrate")
async def api_integrate(req: IntegralRequest):
    try:
        return integrate(req.expression, req.variable, req.lower, req.upper)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/math/simplify")
async def api_simplify(req: SimplifyRequest):
    try:
        return simplify_expr(req.expression)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/math/limit")
async def api_limit(req: LimitRequest):
    try:
        return compute_limit(req.expression, req.variable, req.point)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/math/series")
async def api_series(req: SeriesRequest):
    try:
        return series_expansion(req.expression, req.variable, req.point, req.order)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/math/ode")
async def api_ode(req: ODERequest):
    try:
        return solve_ode(req.equation, req.func_name, req.variable)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/math/matrix")
async def api_matrix(req: MatrixRequest):
    try:
        return matrix_operations(req.matrix, req.operation)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/math/plot")
async def api_plot(req: PlotRequest):
    try:
        return generate_plot_data(req.expression, req.variable, req.x_min, req.x_max, req.points)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Physics Simulations ─────────────────────────────────────

class ProjectileRequest(BaseModel):
    v0: float
    angle: float
    g: float = 9.81

class SHMRequest(BaseModel):
    amplitude: float
    omega: float
    phi: float = 0
    t_max: float = 10

class PendulumRequest(BaseModel):
    length: float
    theta0: float
    g: float = 9.81
    t_max: float = 10

class WaveRequest(BaseModel):
    length: float = 1.0
    c: float = 1.0
    n_modes: int = 5
    t_max: float = 2.0

class ElectricFieldRequest(BaseModel):
    charges: list
    x_range: list = [-5, 5]
    y_range: list = [-5, 5]
    resolution: int = 30

class OrbitalRequest(BaseModel):
    mass_central: float = 1.989e30
    r0: float = 1.496e11
    v0: float = 29780
    t_years: float = 1.0


@router.post("/physics/projectile")
async def api_projectile(req: ProjectileRequest):
    try:
        return projectile_motion(req.v0, req.angle, req.g)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/physics/shm")
async def api_shm(req: SHMRequest):
    try:
        return simple_harmonic_motion(req.amplitude, req.omega, req.phi, req.t_max)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/physics/pendulum")
async def api_pendulum(req: PendulumRequest):
    try:
        return pendulum(req.length, req.theta0, req.g, req.t_max)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/physics/wave")
async def api_wave(req: WaveRequest):
    try:
        return wave_equation_1d(req.length, req.c, req.n_modes, req.t_max)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/physics/electric-field")
async def api_electric_field(req: ElectricFieldRequest):
    try:
        return electric_field_2d(
            req.charges, tuple(req.x_range), tuple(req.y_range), req.resolution
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/physics/orbital")
async def api_orbital(req: OrbitalRequest):
    try:
        return orbital_mechanics(req.mass_central, req.r0, req.v0, req.t_years)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── AI Assistant ─────────────────────────────────────────────

class ExplainRequest(BaseModel):
    expression: str
    operation: str
    variable: str = "x"

class ExerciseRequest(BaseModel):
    topic: str
    difficulty: str = "medium"
    count: int = 5

class ProofRequest(BaseModel):
    claim: str
    justification: str = ""


@router.post("/ai/explain")
async def api_explain(req: ExplainRequest):
    try:
        return explain_step_by_step(req.expression, req.operation, req.variable)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/ai/exercises")
async def api_exercises(req: ExerciseRequest):
    try:
        return generate_exercises(req.topic, req.difficulty, req.count)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/ai/validate-proof")
async def api_validate_proof(req: ProofRequest):
    try:
        return validate_proof_step(req.claim, req.justification)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
