import {
  uniform,
  sym,
  texture,
  $x,
  $y,
  $z,
  $w
} from "../../../../_snowpack/pkg/@thi.ng/shader-ast.js";
export const readConstants = (v_Uv) => {
  const u_constants = uniform("sampler2D", "constants");
  const con = sym(texture(u_constants, v_Uv));
  const mass = sym($x(con));
  const decay = sym($y(con));
  const opt1 = sym($z(con));
  const opt2 = sym($w(con));
  return {
    decl: [u_constants],
    main: [con, mass, decay, opt1, opt2]
  };
};
//# sourceMappingURL=read-constants.js.map
