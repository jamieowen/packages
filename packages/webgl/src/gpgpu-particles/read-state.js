import {
  uniform,
  input,
  sym,
  sub,
  texture,
  $xyz,
  $w
} from "../../../../_snowpack/pkg/@thi.ng/shader-ast.js";
export const readState2 = () => {
  const uni_state1 = uniform("sampler2D", "state_1");
  const uni_state2 = uniform("sampler2D", "state_2");
  const input_vUv = input("vec2", "vReadUV");
  const s1 = sym(texture(uni_state1, input_vUv));
  const s2 = sym(texture(uni_state2, input_vUv));
  const position = sym($xyz(s1));
  const velocity = sym(sub($xyz(s1), $xyz(s2)));
  const age = sym($w(s1));
  return {
    decl: [uni_state1, uni_state2, input_vUv],
    main: [s1, s2, position, velocity, age]
  };
};
//# sourceMappingURL=read-state.js.map
