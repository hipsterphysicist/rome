import { useAppSelector } from "@/lib/store/hooks";

export const About = () => {
  const string: string = useAppSelector((state) => state.data.string);

  if (!string) return;

  return <>About</>;
};
