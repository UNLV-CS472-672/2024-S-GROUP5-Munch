import * as Browser from "expo-web-browser";
import { useEffect } from "react";

export const useWarmUpBrowser = () => {
  useEffect(() => {
    void Browser.warmUpAsync();
    return () => {
      void Browser.coolDownAsync();
    };
  }, []);
};
