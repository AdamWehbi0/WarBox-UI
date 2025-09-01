import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
    ScrollView
} from 'react-native';
import api, { likePost, unlikePost, addComment, getComments } from '../services/api';

interface Post {
    id: string;
    content: string;
    authorHandle: string;
    authorDisplayName: string;
    createdAt: string;
    likeCount: number;
    likedByCurrentUser: boolean;
}

interface Comment {
    id: string;
    content: string;
    authorHandle: string;
    authorDisplayName: string;
    createdAt: string;
}

export default function FeedScreen() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [commentModalVisible, setCommentModalVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts');
            setPosts(response.data);
        } catch (error: any) {
            Alert.alert('Error', 'Failed to load posts');
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPosts();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        return `${diffDays}d`;
    };

    const handleLike = async (postId: string, currentlyLiked: boolean) => {
        try {
            const result = currentlyLiked 
                ? await unlikePost(postId)
                : await likePost(postId);
            
            setPosts(prevPosts => 
                prevPosts.map(post => 
                    post.id === postId 
                        ? { ...post, likedByCurrentUser: !currentlyLiked, likeCount: result.likeCount }
                        : post
                )
            );
        } catch (error: any) {
            Alert.alert('Error', 'Failed to update like');
            console.error('Error toggling like:', error);
        }
    };

    const handleComment = async (post: Post) => {
        setSelectedPost(post);
        setCommentModalVisible(true);
        setCommentLoading(true);
        
        try {
            const postComments = await getComments(post.id);
            setComments(postComments);
        } catch (error: any) {
            Alert.alert('Error', 'Failed to load comments');
            console.error('Error fetching comments:', error);
        } finally {
            setCommentLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !selectedPost) return;

        try {
            await addComment(selectedPost.id, newComment.trim());
            setNewComment('');
            
            const postComments = await getComments(selectedPost.id);
            setComments(postComments);
        } catch (error: any) {
            Alert.alert('Error', 'Failed to add comment');
            console.error('Error adding comment:', error);
        }
    };

    const closeCommentModal = () => {
        setCommentModalVisible(false);
        setSelectedPost(null);
        setComments([]);
        setNewComment('');
    };

    const renderPost = ({ item }: { item: Post }) => (
        <View style={styles.postCard}>
            <View style={styles.postHeader}>
                <Text style={styles.displayName}>{item.authorDisplayName}</Text>
                <Text style={styles.handle}>@{item.authorHandle}</Text>
                <Text style={styles.timestamp}> • {formatDate(item.createdAt)}</Text>
            </View>

            <Text style={styles.content}>{item.content}</Text>

            <View style={styles.postActions}>
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleComment(item)}
                >
                    <Text style={styles.actionText}>💬 Comment</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleLike(item.id, item.likedByCurrentUser)}
                >
                    <Text style={[styles.actionText, item.likedByCurrentUser && styles.likedText]}>
                        {item.likedByCurrentUser ? '❤️' : '🤍'} {item.likeCount}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.loadingText}>Loading posts...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={posts.length === 0 ? styles.centerContainer : undefined}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No posts yet!</Text>
                        <Text style={styles.emptySubtext}>Be the first to post something</Text>
                    </View>
                )}
            />

            <Modal
                visible={commentModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={closeCommentModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={closeCommentModal}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Comments</Text>
                        <View style={styles.placeholder} />
                    </View>

                    {selectedPost && (
                        <View style={styles.postPreview}>
                            <Text style={styles.postAuthor}>
                                {selectedPost.authorDisplayName} @{selectedPost.authorHandle}
                            </Text>
                            <Text style={styles.postContent}>{selectedPost.content}</Text>
                        </View>
                    )}

                    <ScrollView style={styles.commentsContainer}>
                        {commentLoading ? (
                            <Text style={styles.loadingText}>Loading comments...</Text>
                        ) : comments.length === 0 ? (
                            <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
                        ) : (
                            comments.map((comment) => (
                                <View key={comment.id} style={styles.commentItem}>
                                    <Text style={styles.commentAuthor}>
                                        {comment.authorDisplayName} @{comment.authorHandle}
                                    </Text>
                                    <Text style={styles.commentContent}>{comment.content}</Text>
                                    <Text style={styles.commentTime}>{formatDate(comment.createdAt)}</Text>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    <View style={styles.commentInputContainer}>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Write a comment..."
                            value={newComment}
                            onChangeText={setNewComment}
                            multiline
                            maxLength={300}
                        />
                        <TouchableOpacity
                            style={[styles.submitButton, !newComment.trim() && styles.submitButtonDisabled]}
                            onPress={handleAddComment}
                            disabled={!newComment.trim()}
                        >
                            <Text style={[styles.submitButtonText, !newComment.trim() && styles.submitButtonTextDisabled]}>
                                Post
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#7f8c8d',
    },
    postCard: {
        backgroundColor: 'white',
        marginVertical: 4,
        marginHorizontal: 10,
        padding: 15,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    displayName: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#2c3e50',
    },
    handle: {
        fontSize: 14,
        color: '#7f8c8d',
        marginLeft: 5,
    },
    timestamp: {
        fontSize: 14,
        color: '#bdc3c7',
    },
    content: {
        fontSize: 16,
        lineHeight: 22,
        color: '#2c3e50',
        marginBottom: 15,
    },
    postActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: '#ecf0f1',
        paddingTop: 10,
    },
    actionButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 5,
    },
    actionText: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    likedText: {
        color: '#e74c3c',
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#7f8c8d',
        marginBottom: 5,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#bdc3c7',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    closeButton: {
        fontSize: 18,
        color: '#7f8c8d',
        fontWeight: 'bold',
        width: 30,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    placeholder: {
        width: 30,
    },
    postPreview: {
        backgroundColor: 'white',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    postAuthor: {
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 5,
    },
    postContent: {
        fontSize: 16,
        color: '#2c3e50',
        lineHeight: 22,
    },
    commentsContainer: {
        flex: 1,
        padding: 15,
    },
    noCommentsText: {
        textAlign: 'center',
        color: '#7f8c8d',
        fontSize: 16,
        marginTop: 30,
    },
    commentItem: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    commentAuthor: {
        fontWeight: 'bold',
        color: '#2c3e50',
        fontSize: 14,
        marginBottom: 5,
    },
    commentContent: {
        fontSize: 16,
        color: '#2c3e50',
        lineHeight: 20,
        marginBottom: 5,
    },
    commentTime: {
        fontSize: 12,
        color: '#bdc3c7',
    },
    commentInputContainer: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#ecf0f1',
        alignItems: 'flex-end',
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        fontSize: 16,
        maxHeight: 100,
    },
    submitButton: {
        backgroundColor: '#3498db',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    submitButtonDisabled: {
        backgroundColor: '#bdc3c7',
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    submitButtonTextDisabled: {
        color: '#7f8c8d',
    },
});