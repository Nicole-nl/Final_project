import React from "react";
import CurrencyBitcoinRoundedIcon from "@mui/icons-material/CurrencyBitcoinRounded";
import Avatar from "@mui/material/Avatar";

import { AppBar, Container, Toolbar, Typography, Box } from "@mui/material";

function Header() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar color="transparent" position="static">
        <Container>
          <Toolbar>
            <Avatar
              variant="rounded"
              sx={{
                backgroundColor: "#03feed",
                height: 50,
                width: 50,
                marginRight: "15px",
              }}
            >
              <CurrencyBitcoinRoundedIcon
                style={{
                  color: "grey",
                  height: 30,
                  width: 30,
                }}
              />
            </Avatar>
            <Typography
              variant="h5"
              color="primary"
              style={{ cursor: "pointer", fontWeight: "bolder" }}
            >
              Cryptocurrency Tracker
            </Typography>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
}

export default Header;
