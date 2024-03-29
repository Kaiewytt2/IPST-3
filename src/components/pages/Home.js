import React, {useState, useEffect} from 'react';
import {
    Typography,
    Button,
    Modal,
    TextField,
    FormControl,
    InputLabel,
    Input,
    IconButton,
    Grid,
    Card,
    CardContent, Link
} from '@mui/material';
import useAuth from "../useAuth";
import axios from 'axios';

const Home = () => {
    const {logout} = useAuth();
    const [currentFolder, setCurrentFolder] = useState(null);
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [folderPath, setFolderPath] = useState(['root']);
    const [newFolderName, setNewFolderName] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        parentId: "root",
    });

    useEffect(() => {

        loadFolder(folderPath[folderPath.length - 1]);
    }, [folderPath]);

    const loadFolder = async (folderId) => {
        try {
            const folderResponse = await axios.get(`http://5.35.93.223:7000/drive/folder/${folderId}`, {headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}});
            setCurrentFolder(folderResponse.data.data);
            setFolders(folderResponse.data.data.children);
            setFiles(folderResponse.data.data.files);
        } catch (error) {
            console.error('Error loading folder:', error);
        }
    };

    const handleFolderClick = (folder) => {
        setFolderPath(prevPath => [...prevPath, folder.id]);
    };


    const handleBackClick = () => {
        if (folderPath.length > 1) {
            setFolderPath(prevPath => prevPath.slice(0, -1));
        }
    };

    const handleCreateFolder = async () => {
        try {
            const currentFolderId = folderPath[folderPath.length - 1];
            const response = await axios.post(`http://5.35.93.223:7000/drive/folder`, {
                name: newFolderName,
                parentId: currentFolderId
            }, {headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}});
            if (response.status === 200) {
                const newFolder = response.data.data;
                setFolders(prevFolders => [...prevFolders, newFolder]);
                setNewFolderName('');
            }
        } catch (error) {
            console.error('Error creating folder:', error);
        }
    };

    const handleNewFolderNameChange = (event) => {
        setNewFolderName(event.target.value);
    };

    const handleModalOpen = (type) => {
        setModalType(type);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalType('');
        setModalOpen(false);
        setFormData({
            name: '',
            parentId: currentFolder ? currentFolder.id : null,
            file: null,
        });
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        try {
            if (modalType === 'folder') {
                if (currentFolder) {
                    const response = await axios.patch(
                        `http://5.35.93.223:7000/drive/folder/${currentFolder.id}`,
                        {name: formData.name},
                        {headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}}
                    );
                    if (response.status === 200) {
                        console.log('Folder updated successfully:', response.data);
                        const updatedFolder = response.data.data;
                        setFolders(prevFolders => {
                            const updatedFolders = [...prevFolders];
                            const folderIndex = updatedFolders.findIndex(folder => folder.id === updatedFolder.id);
                            if (folderIndex !== -1) {
                                updatedFolders[folderIndex] = updatedFolder;
                            }
                            return updatedFolders;
                        });
                    }
                } else {
                    const response = await axios.post('http://5.35.93.223:7000/drive/folder', formData, {headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}});
                    if (response.status === 200) {
                        const newFolder = response.data.data;
                        setFolders(prevFolders => [...prevFolders, newFolder]);
                    }
                }
            } else if (modalType === 'file') {
                const resformdata = new FormData();
                resformdata.append('file', formData.file);
                resformdata.append('folderId', formData.folderId);

                try {
                    const response = await axios.post('http://5.35.93.223:7000/drive/files', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    });

                    if (response.status === 200) {
                        console.log('Файл успешно загружен', response.data);
                    }
                } catch (error) {
                    console.error('Ошибка при загрузке файла', error);
                }

            }
            handleModalClose();
        } catch (error) {
            console.error('Error submitting form:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
                console.error('Error response headers:', error.response.headers);
            }
        }
    };

    const handleDelete = async (id, type) => {
        try {
            const confirmDelete = window.confirm(`Вы уверены, что хотите удалить этот ${type}?`);
            if (confirmDelete) {
                if (type === 'folder') {
                    await axios.delete(`http://5.35.93.223:7000/drive/folder/${id}`, {headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}});
                } else if (type === 'file') {
                    await axios.delete(`http://5.35.93.223:7000/drive/files/${id}`, {headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}});
                }
                loadFolder(currentFolder ? currentFolder.id : 'root');
            }
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const handleEditFolder = (folder) => {
        setCurrentFolder(folder)
        console.log(currentFolder.parentId)
        setFormData({
            name: currentFolder.name,
            parentId: currentFolder.parentId,
        });
        handleModalOpen('folder');
    };

    const handleMoveFolder = async (newParentId) => {
        try {
            const response = await axios.patch(
                `http://5.35.93.223:7000/drive/folder/${currentFolder.id}`,
                {parentId: newParentId},
                {headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}}
            );
            if (response.status === 200) {
                loadFolder(currentFolder.parentId);
                loadFolder(newParentId);
                handleModalClose();
            }
        } catch (error) {
            console.error('Error moving folder:', error);
        }
    };

    return (
        <div>
            <Typography variant="h4" align="center">
                Ваш диск
            </Typography>
            <Button variant="contained" color="primary" onClick={logout}>
                Выйти
            </Button>
            <Grid container spacing={2}>
                {folders && folders.map((folder) => (
                    <Grid item key={folder.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" component="h2">
                                    {folder.name ? folder.name : folder.file.name}
                                </Typography>
                                <IconButton onClick={() => handleDelete(folder.id, !folder.file?.name ? 'folder': 'file')}>Удалить</IconButton>
                                {!folder.file?.name &&
                                    <IconButton onClick={() => handleEditFolder(folder)}>Редактировать</IconButton>}
                                {!folder.file?.name ?
                                    <IconButton onClick={() => handleFolderClick(folder)}>перейти</IconButton> :
                                    <Link href={folder.file.filepath}>Открыть файл</Link>}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>


            <Button variant="contained" onClick={handleBackClick} disabled={folderPath.length <= 1}>
                Назад
            </Button>

            <TextField
                label="Имя новой папки"
                value={newFolderName}
                onChange={handleNewFolderNameChange}
            />
            <Button variant="contained" onClick={() => handleCreateFolder('folder')}>
                Создать папку
            </Button>
            <Button variant="contained" color="primary" onClick={() => handleModalOpen('file')}>
                Загрузить файл
            </Button>

            <Modal open={modalOpen} onClose={handleModalClose}>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    padding: 20,
                    borderRadius: 8
                }}>
                    <Typography
                        variant="h5">{modalType === 'folder' ? 'Создать/Редактировать папку' : 'Загрузить файл'}</Typography>
                    <form onSubmit={handleFormSubmit}>
                        <FormControl fullWidth style={{marginTop: 10}}>
                            <InputLabel htmlFor="name">Название</InputLabel>
                            <Input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </FormControl>
                        {modalType === 'file' && (
                            <FormControl fullWidth style={{marginTop: 10}}>
                                <InputLabel htmlFor="file">Файл</InputLabel>
                                <Input
                                    id="file"
                                    type="file"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setFormData(prevState => ({
                                                ...prevState,
                                                file: e.target.files[0],
                                                folderId: currentFolder.id
                                            }));
                                        } else console.log("Ничего")
                                    }}
                                    required
                                />
                                <Button type="submit">Загрузить</Button>
                            </FormControl>
                        )}
                        {modalType === 'folder' && (
                            <Button type="submit" variant="contained" color="primary" style={{marginTop: 10}}>
                                {currentFolder ? 'Сохранить' : 'Создать'}
                            </Button>
                        )}
                        {modalType === 'folder' && (
                            <Button onClick={handleModalClose} variant="contained" style={{marginTop: 10}}>
                                Отмена
                            </Button>
                        )}
                    </form>
                    {modalType === 'folder' && currentFolder && (
                        <div>
                            <Typography variant="h6" style={{marginTop: 20}}>Переместить в:</Typography>
                            <Button onClick={() => handleMoveFolder('root')} variant="outlined" style={{marginTop: 10}}>
                                Корневую папку
                            </Button>
                            {folders.map((folder) => (
                                <div key={folder.id}>
                                    {folder.id !== currentFolder.id && (
                                        <Button onClick={() => handleMoveFolder(folder.id)} variant="outlined"
                                                style={{marginTop: 10}}>
                                            {folder.name}
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default Home;
