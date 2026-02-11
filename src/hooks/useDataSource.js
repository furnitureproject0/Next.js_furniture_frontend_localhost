import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUseRealData, selectDataSource } from "@/store/selectors";
import { setUseRealData, toggleDataSource } from "@/store/slices/dataSourceSlice";

export const useDataSource = () => {
	const dispatch = useAppDispatch();
	const dataSource = useAppSelector(selectDataSource);
	const useRealData = useAppSelector(selectUseRealData);

	const setRealData = (value) => {
		dispatch(setUseRealData(value));
	};

	const toggle = () => {
		dispatch(toggleDataSource());
	};

	return {
		useRealData,
		setUseRealData: setRealData,
		toggleDataSource: toggle,
	};
};

