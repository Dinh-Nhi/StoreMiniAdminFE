import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
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

            <Route path="/form-elements" element={<FormElements />} />
            <Route path="/basic-tables" element={<BasicTables />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
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
