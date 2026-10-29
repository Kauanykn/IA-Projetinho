export interface Discipline {
  name: string;
  description: string;
  source: string;
  isMock: boolean;
}

export interface Course {
  slug: string;
  name: string;
  description: string;
  duration: string;
  source: string;
  isMock: boolean;
  disciplines: Discipline[];
}

export const officialSource =
  "https://etecsalesgomes.cps.sp.gov.br/ensino-tecnico/";

// Keep this list empty until course names and curricula can be verified.
export const courses: Course[] = [];
