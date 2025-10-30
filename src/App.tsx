import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import PrivateRoute from "./routes/PrivateRoute";
import InforWebTable from "./pages/InforWeb/InforWebTable";
import BranchTable from "./pages/Branch/BranchTable";
import CategoryTable from "./pages/Category/CategoryTable";
import BranchForm from "./pages/Branch/BranchForm";
import CategoryForm from "./pages/Category/CategoryForm";
import InforWebForm from "./pages/InforWeb/InforWebForm";
import UserTable from "./pages/user/UserTable";
import UserForm from "./pages/user/UserForm";
import ProductsForm from "./pages/Products/ProductsForm";
import ProductsTable from "./pages/Products/ProductsTable";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/blank" element={<Blank />} />

            <Route path="/inforWeb" element={<InforWebTable />} />
            <Route path="/inforWeb/:id" element={<InforWebForm />} />

            <Route path="/branch" element={<BranchTable />} />
            <Route path="/branch/:id" element={<BranchForm />} />

            <Route path="/category" element={<CategoryTable />} />
            <Route path="/category/:id" element={<CategoryForm />} />

            <Route path="/user" element={<UserTable />} />
            <Route path="/user/:id" element={<UserForm />} />

            <Route path="/product" element={<ProductsTable />} />
            <Route path="/product/:id" element={<ProductsForm />} />
          </Route>
        </Route>

        {/* Auth routes */}
        <Route path="/signin" element={<SignIn />} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
