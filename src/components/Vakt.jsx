import { Typography } from "antd";
import PropTypes from "prop-types";

const Vakt = ({ prayer, time, timeRemaining }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 16px",
        backgroundColor: "#f5f5f5",
        borderRadius: 4,
        marginBottom: 8,
      }}
    >
      <div style={{ marginLeft: 10, flex: 1 }}>
        <Typography.Text strong>{`${prayer}: ${time}`}</Typography.Text>
        {timeRemaining && (
          <>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {timeRemaining}
            </Typography.Text>
          </>
        )}
      </div>
    </div>
  );
};

Vakt.propTypes = {
  prayer: PropTypes.string.isRequired,
  time: PropTypes.instanceOf(Date).isRequired,
  timeRemaining: PropTypes.string,
};

export default Vakt;
