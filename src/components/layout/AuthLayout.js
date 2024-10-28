import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { initializeAuth } from "../../redux/reducers/authReducer";

const AuthLayout = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return children;
};

export default AuthLayout;
