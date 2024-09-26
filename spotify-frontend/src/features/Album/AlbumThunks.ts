import {createAsyncThunk} from '@reduxjs/toolkit';
import axiosApi from '../../axiosApi.ts';
import {AlbumI, GlobalError, mutationAlbum} from '../../types.ts';
import {RootState} from '../../app/store.ts';
import {isAxiosError} from 'axios';


export const fetchAlbums = createAsyncThunk<AlbumI[], string>('albums/fetchAlbums', async (id: string,{rejectWithValue}) => {
  try {

    const {data: albums} = await axiosApi.get<AlbumI[]>(`/albums?artist=${id}`)
    return albums
  }
  catch(error) {
    return rejectWithValue(error);
  }
  }
)


export const createAlbum = createAsyncThunk<void, mutationAlbum, {
  rejectValue: GlobalError, state: RootState
}>('products/create', async (albumMutation, {rejectWithValue, getState}) => {
  try {
    const formData = new FormData();

    const keys = Object.keys(albumMutation) as (keyof mutationAlbum)[];
    keys.forEach((key) => {
      const value = albumMutation[key];
      if (value !== null) {
        formData.append(key, value);
      }
    });

    const token = getState().users.user?.token;
    if (!token) {
      console.error('No user token found');
    }
    await axiosApi.post('/albums', formData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (e) {
    if (isAxiosError(e) && e.response && e.response.status === 400) {
      return rejectWithValue(e.response.data)
    }
    throw e
  }
});