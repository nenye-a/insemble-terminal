import { createContext } from '../helpers';

type TutorialContextType = {
  selectedPage: string;
  onPageChange: (selectedPage: string) => void;
};

export let [useTutorialContext, TutorialContextProvider] = createContext<
  TutorialContextType
>();
