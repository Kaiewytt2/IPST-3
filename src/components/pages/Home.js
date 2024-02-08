import React, { useEffect, useState } from 'react';
import { Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {


    return (
        <div>
            <Typography variant="h4" align="center">
                Ваш личный кабинет
            </Typography>
            {is && (
                <Button variant="contained" color="primary" onClick={handleLogout}>
                    Выйти
                </Button>
            )}
        </div>
    );
};

export default Home;