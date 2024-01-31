import { Marck_Script, Montserrat, Roboto } from "next/font/google";

export const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
});

export const roboto = Roboto({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "700", "900"],
});

// Stylish fonts

// export const sacramento = Sacramento({
//   subsets: ["latin"],
//   display: "swap",
//   weight: "400",
// });

// export const windsong = WindSong({
//   subsets: ["latin"],
//   display: "swap",
//   weight: "400",
// });

export const marck_script = Marck_Script({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});

// export const source_code_pro = Source_Code_Pro({
//   subsets: ["latin"],
//   display: "swap",
//   weight: ["300", "400", "700", "900"],
// });
