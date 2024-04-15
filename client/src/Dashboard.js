import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";


const Dashboard = () => {
  const navigate = useNavigate();

  const handleButtonClick = (route) => {
    console.log("Triggered");
    navigate(route);
  };

  return (
    <>
      <h1 className="text-center">FFMPEG Video Editior</h1>

      <nav className="text-center d-flex justify-content-center h-100">
        <Button
          onClick={(e) => {
            e.preventDefault();
            handleButtonClick("green-screen");
          }}
        >
          Green Screen
        </Button>

        <Button className="ms-2"
          onClick={(e) => {
            e.preventDefault();
            handleButtonClick("upload");
          }}
        >
          Upload Video
        </Button>
      </nav>
    </>
  );
};

export default Dashboard;
