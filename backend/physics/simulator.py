"""Physics simulation engine."""

import numpy as np
from scipy.integrate import solve_ivp


def projectile_motion(v0: float, angle_deg: float, g: float = 9.81, dt: float = 0.01) -> dict:
    """Simulate 2D projectile motion."""
    angle = np.radians(angle_deg)
    vx = v0 * np.cos(angle)
    vy = v0 * np.sin(angle)

    t_flight = 2 * vy / g
    t = np.arange(0, t_flight + dt, dt)
    x = vx * t
    y = vy * t - 0.5 * g * t ** 2
    y = np.maximum(y, 0)

    return {
        "t": t.tolist(),
        "x": x.tolist(),
        "y": y.tolist(),
        "max_height": float((vy ** 2) / (2 * g)),
        "range": float((v0 ** 2) * np.sin(2 * angle) / g),
        "flight_time": float(t_flight),
    }


def simple_harmonic_motion(amplitude: float, omega: float, phi: float = 0,
                           t_max: float = 10, dt: float = 0.01) -> dict:
    """Simulate simple harmonic motion."""
    t = np.arange(0, t_max, dt)
    x = amplitude * np.cos(omega * t + phi)
    v = -amplitude * omega * np.sin(omega * t + phi)
    a = -amplitude * omega ** 2 * np.cos(omega * t + phi)

    return {
        "t": t.tolist(),
        "position": x.tolist(),
        "velocity": v.tolist(),
        "acceleration": a.tolist(),
        "period": float(2 * np.pi / omega),
        "frequency": float(omega / (2 * np.pi)),
    }


def pendulum(length: float, theta0_deg: float, g: float = 9.81,
             t_max: float = 10, dt: float = 0.01) -> dict:
    """Simulate a simple pendulum (nonlinear)."""
    theta0 = np.radians(theta0_deg)

    def equations(t, y):
        theta, omega = y
        return [omega, -(g / length) * np.sin(theta)]

    t_span = (0, t_max)
    t_eval = np.arange(0, t_max, dt)
    sol = solve_ivp(equations, t_span, [theta0, 0], t_eval=t_eval, method="RK45")

    return {
        "t": sol.t.tolist(),
        "theta": np.degrees(sol.y[0]).tolist(),
        "omega": sol.y[1].tolist(),
        "x": (length * np.sin(sol.y[0])).tolist(),
        "y": (-length * np.cos(sol.y[0])).tolist(),
    }


def wave_equation_1d(length: float = 1.0, c: float = 1.0, n_modes: int = 5,
                     t_max: float = 2.0, nx: int = 200, nt: int = 200) -> dict:
    """Generate 1D wave equation solution (standing wave superposition)."""
    x = np.linspace(0, length, nx)
    t = np.linspace(0, t_max, nt)

    frames = []
    for ti in t:
        u = np.zeros_like(x)
        for n in range(1, n_modes + 1):
            u += (1.0 / n) * np.sin(n * np.pi * x / length) * np.cos(n * np.pi * c * ti / length)
        frames.append(u.tolist())

    return {
        "x": x.tolist(),
        "t": t.tolist(),
        "frames": frames,
    }


def electric_field_2d(charges: list, x_range: tuple = (-5, 5),
                      y_range: tuple = (-5, 5), resolution: int = 30) -> dict:
    """Compute 2D electric field from point charges.
    charges: list of dicts with keys 'x', 'y', 'q'
    """
    x = np.linspace(x_range[0], x_range[1], resolution)
    y = np.linspace(y_range[0], y_range[1], resolution)
    X, Y = np.meshgrid(x, y)
    Ex = np.zeros_like(X)
    Ey = np.zeros_like(Y)

    k = 8.99e9
    for charge in charges:
        dx = X - charge["x"]
        dy = Y - charge["y"]
        r = np.sqrt(dx ** 2 + dy ** 2)
        r = np.maximum(r, 0.3)  # avoid singularity
        r3 = r ** 3
        Ex += k * charge["q"] * dx / r3
        Ey += k * charge["q"] * dy / r3

    magnitude = np.sqrt(Ex ** 2 + Ey ** 2)
    magnitude = np.maximum(magnitude, 1e-10)
    Ex_norm = Ex / magnitude
    Ey_norm = Ey / magnitude

    return {
        "x": x.tolist(),
        "y": y.tolist(),
        "Ex": Ex_norm.tolist(),
        "Ey": Ey_norm.tolist(),
        "magnitude": np.log10(magnitude + 1).tolist(),
        "charges": charges,
    }


def orbital_mechanics(mass_central: float = 1.989e30, r0: float = 1.496e11,
                      v0: float = 29780, t_years: float = 1.0, dt_days: float = 0.5) -> dict:
    """Simulate orbital mechanics (2-body problem)."""
    G = 6.674e-11
    t_max = t_years * 365.25 * 24 * 3600
    dt = dt_days * 24 * 3600

    def equations(t, state):
        x, y, vx, vy = state
        r = np.sqrt(x ** 2 + y ** 2)
        ax = -G * mass_central * x / r ** 3
        ay = -G * mass_central * y / r ** 3
        return [vx, vy, ax, ay]

    sol = solve_ivp(
        equations, (0, t_max), [r0, 0, 0, v0],
        max_step=dt, method="RK45",
        t_eval=np.arange(0, t_max, dt)
    )

    return {
        "x": (sol.y[0] / 1.496e11).tolist(),  # in AU
        "y": (sol.y[1] / 1.496e11).tolist(),
        "t_days": (sol.t / (24 * 3600)).tolist(),
    }
